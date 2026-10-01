import { createIcon } from './icons.ts'
import type { ToolItem } from './types.ts'

export class ToolButton {
  readonly id: string
  readonly group: string | undefined
  readonly element: HTMLButtonElement

  constructor(item: ToolItem) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'tool-button'
    button.title = item.label
    button.setAttribute('aria-label', item.label)
    button.append(createIcon(item.icon))

    if (item.group) {
      button.setAttribute('aria-pressed', 'false')
    }

    this.id = item.id
    this.group = item.group
    this.element = button
  }

  setSelected(selected: boolean): void {
    this.element.classList.toggle('is-selected', selected)

    if (this.group) {
      this.element.setAttribute('aria-pressed', String(selected))
    }
  }
}
