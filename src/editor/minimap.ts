import {
  ZOOM_LEVELS,
  type MapFrame,
  type MapView,
  type MapViewport,
  type ZoomLevel,
} from './map-grid.ts'
import { appendSvg, createSvg } from '../graphics/primitives/svg.ts'

export class Minimap {
  readonly element: HTMLElement

  private readonly svg: SVGSVGElement
  private readonly viewport: SVGRectElement
  private readonly zoomButtons = new Map<ZoomLevel, HTMLButtonElement>()

  private zoomListener: ((level: ZoomLevel) => void) | undefined
  private centerListener: ((x: number, y: number) => void) | undefined

  constructor(world: MapFrame) {
    const section = document.createElement('section')
    section.className = 'minimap'
    section.setAttribute('aria-label', 'Minimap')
    section.style.setProperty(
      '--world-aspect',
      String(world.width / world.height),
    )

    const heading = document.createElement('div')
    heading.className = 'minimap__heading'

    const title = document.createElement('h2')
    title.className = 'minimap__title'
    title.textContent = 'Minimap'

    const north = document.createElement('span')
    north.className = 'minimap__north'
    north.textContent = 'N'

    heading.append(title, north)

    const zoom = document.createElement('div')
    zoom.className = 'minimap__zoom'

    const zoomLabel = document.createElement('div')
    zoomLabel.className = 'minimap__zoom-label'
    zoomLabel.textContent = 'Zoom'

    const levels = document.createElement('div')
    levels.className = 'minimap__zoom-levels'
    levels.setAttribute('role', 'group')
    levels.setAttribute('aria-label', 'Zoom level')

    for (const level of ZOOM_LEVELS) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'zoom-button'
      button.textContent = String(level)
      button.setAttribute('aria-label', `Zoom ${level}`)
      button.setAttribute('aria-pressed', level === 1 ? 'true' : 'false')

      if (level === 1) {
        button.classList.add('is-selected')
      }

      button.addEventListener('click', () => {
        this.zoomListener?.(level)
      })

      this.zoomButtons.set(level, button)
      levels.append(button)
    }

    zoom.append(zoomLabel, levels)

    const frame = document.createElement('div')
    frame.className = 'minimap__frame'

    this.svg = createSvg('svg', {
      class: 'minimap__grid',
      viewBox: `${world.x} ${world.y} ${world.width} ${world.height}`,
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'World minimap',
    })

    appendSvg(this.svg, 'rect', {
      x: String(world.x),
      y: String(world.y),
      width: String(world.width),
      height: String(world.height),
      fill: '#0e4664',
    })

    this.viewport = appendSvg(this.svg, 'rect', {
      class: 'minimap__viewport',
      x: String(world.x),
      y: String(world.y),
      width: String(world.width),
      height: String(world.height),
      fill: 'rgba(226, 194, 122, 0.16)',
      stroke: '#e2c27a',
      'stroke-width': '2',
      'vector-effect': 'non-scaling-stroke',
    })

    this.svg.addEventListener('click', (event) => {
      const point = clientToSvg(this.svg, event.clientX, event.clientY)
      if (!point) return

      this.centerListener?.(point.x, point.y)
    })

    frame.append(this.svg)
    section.append(heading, zoom, frame)

    this.element = section
  }

  connect(map: MapViewport): void {
    this.zoomListener = (level) => {
      map.setZoomLevel(level)
    }

    this.centerListener = (x, y) => {
      map.centerOn(x, y)
    }

    map.onViewChange((view) => {
      this.showView(view)
    })

    this.showView(map.getView())
  }

  private showView(view: MapView): void {
    this.viewport.setAttribute('x', String(view.x))
    this.viewport.setAttribute('y', String(view.y))
    this.viewport.setAttribute('width', String(view.width))
    this.viewport.setAttribute('height', String(view.height))

    for (const [level, button] of this.zoomButtons) {
      const selected = level === view.zoomLevel
      button.classList.toggle('is-selected', selected)
      button.setAttribute('aria-pressed', selected ? 'true' : 'false')
    }
  }
}

function clientToSvg(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const matrix = svg.getScreenCTM()
  if (!matrix) return null

  const point = svg.createSVGPoint()
  point.x = clientX
  point.y = clientY

  const world = point.matrixTransform(matrix.inverse())

  return {
    x: world.x,
    y: world.y,
  }
}