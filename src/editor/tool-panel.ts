import type { PanelSide, ToolPanelConfig } from './types.ts'
import { ToolSection } from './tool-section.ts'

export class ToolPanel {
  readonly element: HTMLElement

  constructor(config: ToolPanelConfig, side: PanelSide, footer?: HTMLElement) {
    const panel = document.createElement('aside')
    panel.className = `tool-panel tool-panel--${side}`
    panel.setAttribute('aria-label', config.label)

    const scroll = document.createElement('div')
    scroll.className = 'tool-panel__scroll'

    for (const section of config.sections) {
      scroll.append(new ToolSection(section).element)
    }

    panel.append(scroll)

    if (footer) {
      panel.append(footer)
    }

    this.element = panel
  }
}
