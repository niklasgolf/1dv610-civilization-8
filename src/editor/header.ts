import { appendSvg, createSvg } from '../graphics/primitives/svg.ts'

export type AppView = 'world-builder' | 'project-notes'

const APP_VIEWS: ReadonlyArray<readonly [AppView, string]> = [
  ['world-builder', 'World Builder'],
  ['project-notes', 'Project Notes'],
]

export class Header {
  readonly element: HTMLElement

  private readonly buttons = new Map<AppView, HTMLButtonElement>()

  constructor(onChange: (view: AppView) => void) {
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

    const navigation = document.createElement('nav')
    navigation.className = 'editor-header__modes'
    navigation.setAttribute('aria-label', 'Application view')

    for (const [view, label] of APP_VIEWS) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'mode-button'
      button.textContent = label
      button.addEventListener('click', () => {
        onChange(view)
      })
      this.buttons.set(view, button)
      navigation.append(button)
    }

    header.append(createMark(), title, navigation)
    this.element = header
    this.setView('world-builder')
  }

  setView(view: AppView): void {
    for (const [id, button] of this.buttons) {
      const selected = id === view
      button.classList.toggle('is-selected', selected)
      button.setAttribute('aria-pressed', selected ? 'true' : 'false')
    }
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