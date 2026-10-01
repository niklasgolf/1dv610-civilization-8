export class EditorLayout {
  readonly element: HTMLDivElement
  readonly workspace: HTMLDivElement

  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'editor'

    this.workspace = document.createElement('div')
    this.workspace.className = 'editor__workspace'
  }

  mount(header: HTMLElement, ...columns: HTMLElement[]): void {
    this.workspace.append(...columns)
    this.element.append(header, this.workspace)
  }
}
