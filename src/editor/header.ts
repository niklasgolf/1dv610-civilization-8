import { appendSvg, createSvg } from '../graphics/primitives/svg.ts'

export class Header {
  readonly element: HTMLElement

  constructor() {
    const header = document.createElement('header')
    header.className = 'editor-header'

    const title = document.createElement('h1')
    title.className = 'editor-header__title'

    const name = document.createElement('span')
    name.className = 'editor-header__name'
    name.textContent = 'Civilization 8'

    const dash = document.createElement('span')
    dash.className = 'editor-header__dash'
    dash.setAttribute('aria-hidden', 'true')
    dash.textContent = '—'

    const mode = document.createElement('span')
    mode.className = 'editor-header__mode'
    mode.textContent = 'World Builder'

    title.append(name, dash, mode)
    header.append(createMark(), title)

    this.element = header
  }
}

function createMark(): SVGSVGElement {
  const mark = createSvg('svg', {
    class: 'editor-header__mark',
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
  })

  appendSvg(mark, 'path', {
    d: 'M12 2.2 20.4 7.1 20.4 16.9 12 21.8 3.6 16.9 3.6 7.1Z',
    fill: '#1b6a86',
    stroke: '#e2c27a',
    'stroke-width': '1.4',
    'stroke-linejoin': 'round',
  })

  return mark
}