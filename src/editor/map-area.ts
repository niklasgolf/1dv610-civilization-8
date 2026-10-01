import {
  worldDatabase,
  type HexRecord,
  type Terrain,
} from '../database/world-database.ts'

import { MapGrid } from './map-grid.ts'

const TERRAIN_FILL: Record<Terrain, string> = {
  ocean: '#0e4664',
  grass: 'green',
  desert: '#c9a45c',
}

export class MapArea {
  readonly element: HTMLElement
  readonly mapGrid: MapGrid

  constructor() {
    const main = document.createElement('main')
    main.className = 'map-area'
    main.setAttribute('aria-label', 'Map')

    this.mapGrid = new MapGrid()
    main.append(this.mapGrid.element)

    this.element = main
  }

  async initialize(): Promise<void> {
    await worldDatabase.initializeWorld(this.mapGrid.getCoordinates())

    const hexRecords = await worldDatabase.hexes.toArray()

    for (const hexRecord of hexRecords) {
      this.renderHexTerrain(hexRecord)
    }
  }

  private renderHexTerrain(hexRecord: HexRecord): void {
    this.mapGrid.setHexFill(
      {
        x: hexRecord.x,
        y: hexRecord.y,
      },
      TERRAIN_FILL[hexRecord.terrain],
    )
  }
}