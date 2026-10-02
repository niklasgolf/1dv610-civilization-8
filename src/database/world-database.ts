import Dexie, { type Table } from 'dexie'
import type { Coordinate } from 'midgard-hex-grid'

export type Terrain = 'ocean' | 'coast' | 'grass' | 'desert'

export type Relief = 'flat' | 'hills' | 'mountain'

export interface HexRecord {
  x: number
  y: number
  terrain: Terrain
  relief: Relief
}

const DEFAULT_TERRAIN: Terrain = 'ocean'
const DEFAULT_RELIEF: Relief = 'flat'

const INITIAL_COAST_COORDINATE: Coordinate = {
  x: 6,
  y: 4,
}

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

    this.version(2)
      .stores({
        hexes: '[x+y], terrain',
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<HexRecord, [number, number]>('hexes')
          .update(
            [
              INITIAL_COAST_COORDINATE.x,
              INITIAL_COAST_COORDINATE.y,
            ],
            {
              terrain: 'coast',
            },
          )
      })

    this.version(3)
      .stores({
        hexes: '[x+y], terrain, relief',
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<HexRecord, [number, number]>('hexes')
          .toCollection()
          .modify({
            relief: DEFAULT_RELIEF,
          })
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
      relief: DEFAULT_RELIEF,
    }))

    await this.hexes.bulkAdd(hexRecords)
  }

  private initialTerrainFor(coordinate: Coordinate): Terrain {
    const isInitialCoastHex =
      coordinate.x === INITIAL_COAST_COORDINATE.x &&
      coordinate.y === INITIAL_COAST_COORDINATE.y

    if (isInitialCoastHex) {
      return 'coast'
    }

    const isInitialGrassHex =
      coordinate.x === INITIAL_GRASS_COORDINATE.x &&
      coordinate.y === INITIAL_GRASS_COORDINATE.y

    if (isInitialGrassHex) {
      return 'grass'
    }

    return DEFAULT_TERRAIN
  }
}

export const worldDatabase = new WorldDatabase()