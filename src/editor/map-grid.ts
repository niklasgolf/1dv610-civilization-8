import { HexGrid, type Coordinate } from 'midgard-hex-grid'

import { appendSvg, createSvg } from './svg.ts'

const SKELETON_WIDTH = 42
const SKELETON_HEIGHT = 13

/**
 * Canonical width of one x-dominated hex, in world units.
 *
 * Civilization 8 designs map graphics against this scale.
 * The library turns a 260-unit width into a hex of about
 * 260 × 300.22 world units. Future SVG artwork — forests,
 * mountains, resources, improvements, wonders — is drawn
 * in that coordinate space.
 *
 * 260 is a world/SVG size, not a screen-pixel size.
 * The camera viewBox decides how much of the world is visible.
 * The library remains the source of the resulting geometry.
 */
const HEX_WORLD_WIDTH = 260

/**
 * Margin around the complete world, in world units.
 * The previous 32-unit geometry used 12 units of padding,
 * which is 12/32 of one hex width. The same fraction keeps
 * the Zoom 1 overview margin when the world scale changes.
 */
const WORLD_VIEW_PADDING = HEX_WORLD_WIDTH * (12 / 32)

const HEX_FILL = '#0e4664'
const HEX_STROKE = '#3d8eab'

/**
 * Five camera levels. Zoom 1 fits the whole world in the map viewport.
 * Zoom 5 is 1 world unit = 1 CSS pixel. Levels 2–4 are the geometric
 * steps between those two endpoints, so they are not stored as constants.
 */
export const ZOOM_LEVELS = [1, 2, 3, 4, 5] as const

const ZOOM_STEP_COUNT = ZOOM_LEVELS.length - 1

export type ZoomLevel = (typeof ZOOM_LEVELS)[number]

export type MapFrame = {
  x: number
  y: number
  width: number
  height: number
}

export type MapView = MapFrame & {
  zoomLevel: ZoomLevel
}

export interface MapViewport {
  getWorldFrame(): MapFrame
  getView(): MapView
  setZoomLevel(level: ZoomLevel): void
  centerOn(x: number, y: number): void
  onViewChange(listener: (view: MapView) => void): void
}

function coordinateKey(coordinate: Coordinate): string {
  return `${coordinate.x}-${coordinate.y}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function clampAxis(
  center: number,
  origin: number,
  span: number,
  viewSpan: number,
): number {
  if (viewSpan >= span) return origin + span / 2
  const min = origin + viewSpan / 2
  const max = origin + span - viewSpan / 2
  return clamp(center, min, max)
}

/**
 * CSS pixels per world unit for each zoom level.
 * Zoom 1 is the fit scale. Zoom 5 is exactly 1.
 * The four steps between them share one ratio: (1 / fitScale) ^ (1/4).
 */
function zoomScales(fitScale: number): readonly number[] {
  const ratio = Math.pow(1 / fitScale, 1 / ZOOM_STEP_COUNT)
  return ZOOM_LEVELS.map((level) =>
    level === ZOOM_LEVELS.length ? 1 : fitScale * ratio ** (level - 1),
  )
}

function frameOf(frame: MapFrame): MapFrame {
  return {
    x: frame.x,
    y: frame.y,
    width: frame.width,
    height: frame.height,
  }
}

export class MapGrid implements MapViewport {
  readonly element: SVGSVGElement

  private readonly polygons = new Map<string, SVGPolygonElement>()
  private readonly world: MapFrame
  private readonly viewListeners: Array<(view: MapView) => void> = []

  private centerX: number
  private centerY: number
  private zoomLevel: ZoomLevel = 1
  private view: MapView
  private viewportWidth = 0
  private viewportHeight = 0

  constructor() {
    const grid = new HexGrid('x-dominated')
    const hexagons = grid.createGrid({
      hexDiameter: HEX_WORLD_WIDTH,
      skeletonWidth: SKELETON_WIDTH,
      skeletonHeight: SKELETON_HEIGHT,
    })
    const bounds = grid.getGridBounds(
      hexagons.map((hexagon) => hexagon.coordinate),
      HEX_WORLD_WIDTH,
    )

    this.world = {
      x: bounds.minX - WORLD_VIEW_PADDING,
      y: bounds.minY - WORLD_VIEW_PADDING,
      width: bounds.width + WORLD_VIEW_PADDING * 2,
      height: bounds.height + WORLD_VIEW_PADDING * 2,
    }
    this.centerX = this.world.x + this.world.width / 2
    this.centerY = this.world.y + this.world.height / 2
    this.view = {
      ...frameOf(this.world),
      zoomLevel: 1,
    }

    const canvas = createSvg('svg', {
      class: 'map-area__grid',
      viewBox: this.viewBoxOf(this.view),
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img',
      'aria-label': 'Hexagonal world map',
    })

    for (const hexagon of hexagons) {
      const key = coordinateKey(hexagon.coordinate)
      const polygon = appendSvg(canvas, 'polygon', {
        id: `hex-${key}`,
        'data-x': String(hexagon.coordinate.x),
        'data-y': String(hexagon.coordinate.y),
        points: hexagon.points
          .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
          .join(' '),
        fill: HEX_FILL,
        stroke: HEX_STROKE,
        'stroke-width': '1',
        'stroke-linejoin': 'round',
        'vector-effect': 'non-scaling-stroke',
      })
      this.polygons.set(key, polygon)
    }

    this.element = canvas
    new ResizeObserver(() => {
      this.applyView()
    }).observe(canvas)
  }

  getWorldFrame(): MapFrame {
    return frameOf(this.world)
  }

  getView(): MapView {
    return { ...this.view }
  }

  setZoomLevel(level: ZoomLevel): void {
    this.zoomLevel = level
    this.applyView()
  }

  centerOn(x: number, y: number): void {
    this.centerX = x
    this.centerY = y
    this.applyView()
  }

  onViewChange(listener: (view: MapView) => void): void {
    this.viewListeners.push(listener)
  }

  setHexFill(coordinate: Coordinate, fill: string): void {
    const polygon = this.polygons.get(coordinateKey(coordinate))
    if (!polygon) {
      throw new Error(
        `No hexagon is rendered at coordinate (${coordinate.x}, ${coordinate.y}).`,
      )
    }
    polygon.setAttribute('fill', fill)
  }

  private applyView(): void {
    const viewport = this.element.getBoundingClientRect()
    this.viewportWidth = viewport.width
    this.viewportHeight = viewport.height

    const fitted = this.fittedViewSize()
    const center = this.clampCenter(this.centerX, this.centerY, fitted.width, fitted.height)
    this.centerX = center.x
    this.centerY = center.y

    this.view = {
      x: center.x - fitted.width / 2,
      y: center.y - fitted.height / 2,
      width: fitted.width,
      height: fitted.height,
      zoomLevel: this.zoomLevel,
    }
    this.element.setAttribute('viewBox', this.viewBoxOf(this.view))

    const view = this.getView()
    for (const listener of this.viewListeners) {
      listener(view)
    }
  }

  /**
   * ViewBox size in world units for the current zoom.
   * The box matches the SVG viewport's aspect ratio, so
   * preserveAspectRatio does not add a second scale.
   * At Zoom 5 the box equals the viewport in CSS pixels.
   */
  private fittedViewSize(): { width: number; height: number } {
    if (this.viewportWidth <= 0 || this.viewportHeight <= 0) {
      return { width: this.world.width, height: this.world.height }
    }

    const scale = zoomScales(this.fitScale())[this.zoomLevel - 1]
    return {
      width: this.viewportWidth / scale,
      height: this.viewportHeight / scale,
    }
  }

  /** CSS pixels per world unit when the whole world just fits. */
  private fitScale(): number {
    return Math.min(
      this.viewportWidth / this.world.width,
      this.viewportHeight / this.world.height,
    )
  }

  private clampCenter(
    centerX: number,
    centerY: number,
    viewWidth: number,
    viewHeight: number,
  ): { x: number; y: number } {
    return {
      x: clampAxis(centerX, this.world.x, this.world.width, viewWidth),
      y: clampAxis(centerY, this.world.y, this.world.height, viewHeight),
    }
  }

  private viewBoxOf(frame: MapFrame): string {
    return `${frame.x} ${frame.y} ${frame.width} ${frame.height}`
  }
}
