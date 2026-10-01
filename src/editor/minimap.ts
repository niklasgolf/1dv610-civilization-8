import { worldMapPlaceholder } from './map-grid.ts'
import { appendSvg, createSvg } from './svg.ts'

export class Minimap {
  readonly element: HTMLElement

  constructor() {
    const section = document.createElement('section')
    section.className = 'minimap'
    section.setAttribute('aria-label', 'Minimap')

    const heading = document.createElement('div')
    heading.className = 'minimap__heading'

    const title = document.createElement('h2')
    title.className = 'minimap__title'
    title.textContent = 'Minimap'

    const north = document.createElement('span')
    north.className = 'minimap__north'
    north.textContent = 'N'

    heading.append(title, north)

    const frame = document.createElement('div')
    frame.className = 'minimap__frame'
    frame.append(createMinimapPlaceholder())
    section.append(heading, frame)
    this.element = section
  }
}

function createMinimapPlaceholder(): SVGSVGElement {
  const canvas = createSvg('svg', {
    class: 'minimap__grid',
    viewBox: '0 0 320 180',
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': 'Minimap placeholder',
  })

  appendSvg(canvas, 'rect', {
    x: '16',
    y: '14',
    width: '288',
    height: '152',
    rx: '4',
    fill: 'rgba(47, 134, 163, 0.45)',
    stroke: '#1b6a86',
    'stroke-width': '1',
  })

  appendSvg(canvas, 'rect', {
    x: '40',
    y: '32',
    width: '240',
    height: '116',
    fill: 'rgba(226, 194, 122, 0.12)',
    stroke: '#e2c27a',
    'stroke-width': '2',
  })

  const label = appendSvg(canvas, 'text', {
    x: '160',
    y: '96',
    'text-anchor': 'middle',
    fill: '#f3ead7',
    'font-size': '14',
    'font-family': 'Avenir Next, Segoe UI, sans-serif',
    'letter-spacing': '0.12em',
  })
  label.textContent = `${worldMapPlaceholder.skeletonWidth} × ${worldMapPlaceholder.skeletonHeight}`

  return canvas
}
