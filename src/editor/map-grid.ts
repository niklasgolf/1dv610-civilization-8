import { appendSvg, createSvg } from './svg.ts'

/**
 * Intended future grid. The real hex library is not connected yet.
 * These values are only used as a label, not to calculate a grid.
 */
export const worldMapPlaceholder = {
  orientation: 'x-dominated',
  skeletonWidth: 42,
  skeletonHeight: 13,
} as const

const PLACEHOLDER_LABEL = `${worldMapPlaceholder.skeletonWidth} × ${worldMapPlaceholder.skeletonHeight} World Map`

export function createMapPlaceholder(): SVGSVGElement {
  const canvas = createSvg('svg', {
    class: 'map-area__grid',
    viewBox: '0 0 1200 720',
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': `${PLACEHOLDER_LABEL}, ${worldMapPlaceholder.orientation}`,
  })

  appendSvg(canvas, 'rect', {
    x: '36',
    y: '28',
    width: '1128',
    height: '664',
    rx: '10',
    fill: 'rgba(14, 58, 78, 0.35)',
    stroke: '#a68445',
    'stroke-width': '2',
  })

  appendSvg(canvas, 'path', {
    d: 'M600 168 820 292 V516 L600 640 380 516 V292 Z',
    fill: 'rgba(27, 106, 134, 0.72)',
    stroke: '#e2c27a',
    'stroke-width': '2',
    'stroke-linejoin': 'round',
  })

  const title = appendSvg(canvas, 'text', {
    x: '600',
    y: '392',
    'text-anchor': 'middle',
    fill: '#f3ead7',
    'font-size': '28',
    'font-family': 'Avenir Next, Segoe UI, sans-serif',
    'letter-spacing': '0.14em',
  })
  title.textContent = PLACEHOLDER_LABEL

  const detail = appendSvg(canvas, 'text', {
    x: '600',
    y: '428',
    'text-anchor': 'middle',
    fill: '#e2c27a',
    'font-size': '16',
    'font-family': 'Avenir Next, Segoe UI, sans-serif',
    'letter-spacing': '0.18em',
  })
  detail.textContent = worldMapPlaceholder.orientation

  return canvas
}
