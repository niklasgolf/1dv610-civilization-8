import { HexGrid, type Coordinate } from 'midgard-hex-grid'

import { appendSvg, createSvg } from './svg.ts'

const SKELETON_WIDTH = 42
const SKELETON_HEIGHT = 13

/**
 * Full width of one hexagon in the library geometry.
 * An x-dominated grid treats hexDiameter as that width.
 * The SVG viewBox scales this geometry to the map area.
 */
const HEX_WIDTH = 32

const VIEW_PADDING = 12

const HEX_FILL = '#0e4664'
const HEX_STROKE = '#3d8eab'

function coordinateKey(coordinate: Coordinate): string {
  return `${coordinate.x}-${coordinate.y}`
}

export class MapGrid {
  readonly element: SVGSVGElement

  private readonly polygons = new Map<string, SVGPolygonElement>()

  constructor() {
    const grid = new HexGrid('x-dominated')
    const hexagons = grid.createGrid({
      hexDiameter: HEX_WIDTH,
      skeletonWidth: SKELETON_WIDTH,
      skeletonHeight: SKELETON_HEIGHT,
    })
    const bounds = grid.getGridBounds(
      hexagons.map((hexagon) => hexagon.coordinate),
      HEX_WIDTH,
    )

    const canvas = createSvg('svg', {
      class: 'map-area__grid',
      viewBox: [
        bounds.minX - VIEW_PADDING,
        bounds.minY - VIEW_PADDING,
        bounds.width + VIEW_PADDING * 2,
        bounds.height + VIEW_PADDING * 2,
      ].join(' '),
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
}
