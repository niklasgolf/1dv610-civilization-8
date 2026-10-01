import { MapGrid } from './map-grid.ts'

export class MapArea {
  readonly element: HTMLElement
  readonly mapGrid: MapGrid

  constructor() {
    const main = document.createElement('main')
    main.className = 'map-area'
    main.setAttribute('aria-label', 'Map')
    this.mapGrid = new MapGrid()
    // Temporary proof that one logical coordinate can change one hex fill.
    this.mapGrid.setHexFill({ x: 12, y: 4 }, 'green')
    main.append(this.mapGrid.element)
    this.element = main
  }
}
