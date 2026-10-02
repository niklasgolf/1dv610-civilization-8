import { HexGrid } from 'midgard-hex-grid'

export const HEX_WORLD_WIDTH = 260

const grid = new HexGrid('x-dominated')

const canonicalHexagon = grid.createSingleHexagon({
  hexDiameter: HEX_WORLD_WIDTH,
})

const minX = Math.min(...canonicalHexagon.points.map((point) => point.x))
const maxX = Math.max(...canonicalHexagon.points.map((point) => point.x))
const minY = Math.min(...canonicalHexagon.points.map((point) => point.y))
const maxY = Math.max(...canonicalHexagon.points.map((point) => point.y))

export const HEX_BOUNDS = {
  x: minX,
  y: minY,
  width: maxX - minX,
  height: maxY - minY,
} as const

export const HEX_POINTS = canonicalHexagon.points.map((point) => ({
  x: point.x - HEX_BOUNDS.x,
  y: point.y - HEX_BOUNDS.y,
}))