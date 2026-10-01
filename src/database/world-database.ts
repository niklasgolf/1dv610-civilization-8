import Dexie, { type Table } from 'dexie'
import type { Coordinate } from 'midgard-hex-grid'

export type Terrain = 'ocean' | 'grass' | 'desert'

export interface HexRecord {
  x: number
  y: number
  terrain: Terrain
}

const DEFAULT_TERRAIN: Terrain = 'ocean'

const INITIAL_GRASS_COORDINATE: Coordinate = {
  x: 12,
  y: 4,
}

export class WorldDatabase extends Dexie {
  readonly hexes!: Table<HexRecord, [number, number]>

  constructor() {
    super('civilization-8-world')

    this.version(1).stores({
      hexes: '[x+y], terrain',
    })
  }

  async initializeWorld(coordinates: readonly Coordinate[]): Promise<void> {
    const existingHexCount = await this.hexes.count()

    if (existingHexCount > 0) {
      return
    }

    const hexRecords: HexRecord[] = coordinates.map((coordinate) => ({
      x: coordinate.x,
      y: coordinate.y,
      terrain: this.initialTerrainFor(coordinate),
    }))

    await this.hexes.bulkAdd(hexRecords)
  }

  private initialTerrainFor(coordinate: Coordinate): Terrain {
    const isInitialGrassHex =
      coordinate.x === INITIAL_GRASS_COORDINATE.x &&
      coordinate.y === INITIAL_GRASS_COORDINATE.y

    return isInitialGrassHex ? 'grass' : DEFAULT_TERRAIN
  }
}

export const worldDatabase = new WorldDatabase()