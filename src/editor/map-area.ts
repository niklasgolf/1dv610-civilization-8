import { MapGrid } from './map-grid.ts'

export class MapArea {
  readonly element: HTMLElement

  constructor() {
    const main = document.createElement('main')
    main.className = 'map-area'
    main.setAttribute('aria-label', 'Map')
    const mapGrid = new MapGrid()
    // Temporary proof that one logical coordinate can change one hex fill.
    mapGrid.setHexFill({ x: 12, y: 4 }, 'green')
    main.append(mapGrid.element)
    this.element = main
  }
}
