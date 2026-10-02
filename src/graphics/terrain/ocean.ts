import { HEX_BOUNDS, HEX_POINTS } from '../definitions/hex.ts'
import { appendSvg, createSvg } from '../primitives/svg.ts'

let oceanSerial = 0

export function createOcean(): SVGSVGElement {
  oceanSerial += 1

  const clipId = `ocean-clip-${oceanSerial}`
  const gradientId = `ocean-gradient-${oceanSerial}`

  const svg = createSvg('svg', {
    viewBox: `0 0 ${HEX_BOUNDS.width} ${HEX_BOUNDS.height}`,
    preserveAspectRatio: 'none',
    'aria-hidden': 'true',
  })

  const defs = appendSvg(svg, 'defs')

  const clipPath = appendSvg(defs, 'clipPath', {
    id: clipId,
  })

  appendSvg(clipPath, 'polygon', {
    points: pointsAttribute(),
  })

  const gradient = appendSvg(defs, 'linearGradient', {
    id: gradientId,
    x1: '0',
    y1: '0',
    x2: '0',
    y2: '1',
  })

  appendSvg(gradient, 'stop', {
    offset: '0%',
    'stop-color': '#164f70',
  })

  appendSvg(gradient, 'stop', {
    offset: '55%',
    'stop-color': '#0e4664',
  })

  appendSvg(gradient, 'stop', {
    offset: '100%',
    'stop-color': '#0a3854',
  })

  const artwork = appendSvg(svg, 'g', {
    'clip-path': `url(#${clipId})`,
  })

  appendSvg(artwork, 'rect', {
    x: '0',
    y: '0',
    width: String(HEX_BOUNDS.width),
    height: String(HEX_BOUNDS.height),
    fill: `url(#${gradientId})`,
  })

  appendSvg(artwork, 'ellipse', {
    cx: String(HEX_BOUNDS.width * 0.28),
    cy: String(HEX_BOUNDS.height * 0.32),
    rx: String(HEX_BOUNDS.width * 0.42),
    ry: String(HEX_BOUNDS.height * 0.24),
    fill: '#28718e',
    opacity: '0.16',
  })

  appendSvg(artwork, 'ellipse', {
    cx: String(HEX_BOUNDS.width * 0.78),
    cy: String(HEX_BOUNDS.height * 0.72),
    rx: String(HEX_BOUNDS.width * 0.38),
    ry: String(HEX_BOUNDS.height * 0.22),
    fill: '#062f49',
    opacity: '0.18',
  })

  addWave(artwork, 0.20, 0.27, 0.43)
  addWave(artwork, 0.53, 0.20, 0.35)
  addWave(artwork, 0.31, 0.46, 0.38)
  addWave(artwork, 0.63, 0.52, 0.28)
  addWave(artwork, 0.17, 0.68, 0.34)
  addWave(artwork, 0.49, 0.77, 0.40)

  return svg
}

function addWave(
  parent: SVGElement,
  x: number,
  y: number,
  width: number,
): void {
  const startX = HEX_BOUNDS.width * x
  const startY = HEX_BOUNDS.height * y
  const waveWidth = HEX_BOUNDS.width * width
  const rise = HEX_BOUNDS.height * 0.018

  appendSvg(parent, 'path', {
    d: [
      `M ${startX} ${startY}`,
      `C ${startX + waveWidth * 0.18} ${startY - rise}`,
      `${startX + waveWidth * 0.32} ${startY - rise}`,
      `${startX + waveWidth * 0.5} ${startY}`,
      `C ${startX + waveWidth * 0.68} ${startY + rise}`,
      `${startX + waveWidth * 0.82} ${startY + rise}`,
      `${startX + waveWidth} ${startY}`,
    ].join(' '),
    fill: 'none',
    stroke: '#82b9ca',
    'stroke-width': '2.2',
    'stroke-linecap': 'round',
    opacity: '0.22',
  })
}

function pointsAttribute(): string {
  return HEX_POINTS.map((point) => `${point.x},${point.y}`).join(' ')
}