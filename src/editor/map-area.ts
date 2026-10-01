import { createMapPlaceholder } from './map-grid.ts'

export class MapArea {
  readonly element: HTMLElement

  constructor() {
    const main = document.createElement('main')
    main.className = 'map-area'
    main.setAttribute('aria-label', 'Map')
    main.append(createMapPlaceholder())
    this.element = main
  }
}
