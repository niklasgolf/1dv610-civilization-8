import { leftTools, rightTools } from './catalog.ts'
import { EditorLayout } from './editor-layout.ts'
import { Header, type AppView } from './header.ts'
import { MapArea } from './map-area.ts'
import { Minimap } from './minimap.ts'
import { ProjectNotes } from './project-notes.ts'
import { ToolPanel } from './tool-panel.ts'

export class WorldBuilder {
  private readonly header: Header
  private readonly workspace: HTMLElement
  private readonly editorColumns: HTMLElement[]
  private readonly notes = new ProjectNotes()

  constructor(root: HTMLElement) {
    const layout = new EditorLayout()
    const mapArea = new MapArea()
    const minimap = new Minimap(mapArea.mapGrid.getWorldFrame())

    this.header = new Header((view) => {
      this.show(view)
    })
    this.workspace = layout.workspace
    this.editorColumns = [
      new ToolPanel(leftTools, 'left').element,
      mapArea.element,
      new ToolPanel(rightTools, 'right', minimap.element).element,
    ]

    layout.mount(this.header.element, ...this.editorColumns)
    root.replaceChildren(layout.element)
    minimap.connect(mapArea.mapGrid)

    void mapArea.initialize()
  }

  private show(view: AppView): void {
    this.header.setView(view)
    if (view === 'world-builder') {
      this.workspace.replaceChildren(...this.editorColumns)
      return
    }
    this.workspace.replaceChildren(this.notes.element)
  }
}