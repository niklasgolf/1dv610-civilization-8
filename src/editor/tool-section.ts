import type { ToolSectionConfig } from './types.ts'
import { ToolButton } from './tool-button.ts'

export class ToolSection {
  readonly element: HTMLElement

  private readonly buttons: ToolButton[] = []

  constructor(config: ToolSectionConfig) {
    const section = document.createElement('section')
    section.className = 'tool-section'
    section.setAttribute('aria-label', config.title)

    const title = document.createElement('h2')
    title.className = 'tool-section__title'
    title.textContent = config.title

    const body = document.createElement('div')
    body.className = 'tool-section__body'

    const palette = document.createElement('div')
    palette.className = 'tool-grid'
    const actions = document.createElement('div')
    actions.className = 'tool-grid'

    for (const item of config.items) {
      const button = new ToolButton(item)
      this.buttons.push(button)
      button.element.addEventListener('click', () => {
        this.select(button)
      })

      if (button.group) {
        palette.append(button.element)
      } else {
        actions.append(button.element)
      }
    }

    body.append(palette)

    if (actions.childElementCount > 0) {
      body.append(actions)
    }

    section.append(title, body)
    this.element = section

    const initial = this.buttons.find((button) => button.id === config.defaultSelectedId)
    if (initial) {
      this.select(initial)
    }
  }

  private select(button: ToolButton): void {
    if (!button.group) {
      return
    }

    for (const candidate of this.buttons) {
      if (candidate.group === button.group) {
        candidate.setSelected(candidate === button)
      }
    }
  }
}
