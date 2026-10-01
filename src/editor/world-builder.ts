import { leftTools, rightTools } from './catalog.ts'
import { EditorLayout } from './editor-layout.ts'
import { Header } from './header.ts'
import { MapArea } from './map-area.ts'
import { Minimap } from './minimap.ts'
import { ToolPanel } from './tool-panel.ts'

export class WorldBuilder {
  constructor(root: HTMLElement) {
    const layout = new EditorLayout()

    layout.mount(
      new Header().element,
      new ToolPanel(leftTools, 'left').element,
      new MapArea().element,
      new ToolPanel(rightTools, 'right', new Minimap().element).element,
    )

    root.replaceChildren(layout.element)
  }
}
