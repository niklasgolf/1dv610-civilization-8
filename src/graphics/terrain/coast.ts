import { HEX_BOUNDS, HEX_POINTS } from '../definitions/hex.ts'
import { appendSvg, createSvg } from '../primitives/svg.ts'

let coastSerial = 0

export function createCoast(): SVGSVGElement {
  coastSerial += 1

  const clipId = `coast-clip-${coastSerial}`
  const gradientId = `coast-gradient-${coastSerial}`

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
    'stop-color': '#3f9bb4',
  })

  appendSvg(gradient, 'stop', {
    offset: '52%',
    'stop-color': '#2d829f',
  })

  appendSvg(gradient, 'stop', {
    offset: '100%',
    'stop-color': '#206b89',
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
    cy: String(HEX_BOUNDS.height * 0.3),
    rx: String(HEX_BOUNDS.width * 0.4),
    ry: String(HEX_BOUNDS.height * 0.23),
    fill: '#74c0cf',
    opacity: '0.18',
  })

  appendSvg(artwork, 'ellipse', {
    cx: String(HEX_BOUNDS.width * 0.78),
    cy: String(HEX_BOUNDS.height * 0.72),
    rx: String(HEX_BOUNDS.width * 0.4),
    ry: String(HEX_BOUNDS.height * 0.23),
    fill: '#17617f',
    opacity: '0.16',
  })

  addWave(artwork, 0.2, 0.25, 0.42)
  addWave(artwork, 0.52, 0.34, 0.32)
  addWave(artwork, 0.27, 0.48, 0.37)
  addWave(artwork, 0.6, 0.58, 0.29)
  addWave(artwork, 0.18, 0.7, 0.34)
  addWave(artwork, 0.49, 0.79, 0.39)

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
    stroke: '#b9e0e7',
    'stroke-width': '2.2',
    'stroke-linecap': 'round',
    opacity: '0.28',
  })
}

function pointsAttribute(): string {
  return HEX_POINTS.map((point) => `${point.x},${point.y}`).join(' ')
}