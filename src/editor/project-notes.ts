import { loadBookParts, renderMarkdown, type BookPart } from './book-parts.ts'

export class ProjectNotes {
  readonly element: HTMLElement

  private readonly reading: HTMLElement
  private readonly page: HTMLElement
  private readonly buttons = new Map<string, HTMLButtonElement>()

  constructor() {
    const parts = loadBookParts()

    const workspace = document.createElement('div')
    workspace.className = 'project-notes'

    const navigation = document.createElement('nav')
    navigation.className = 'project-notes__nav'
    navigation.setAttribute('aria-label', 'Book parts')

    const list = document.createElement('div')
    list.className = 'project-notes__parts'
    this.reading = document.createElement('div')
    this.reading.className = 'project-notes__reading'

    this.page = document.createElement('article')
    this.page.className = 'project-notes__page'

    for (const part of parts) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'part-button'
      button.textContent = part.title
      button.addEventListener('click', () => {
        this.show(part)
      })
      this.buttons.set(part.id, button)
      list.append(button)
    }

    navigation.append(list)
    this.reading.append(this.page)
    workspace.append(navigation, this.reading)
    this.element = workspace

    const firstPart = parts[0]
    if (firstPart) {
      this.show(firstPart)
    }
  }

  private show(part: BookPart): void {
    this.page.innerHTML = renderMarkdown(part.markdown)
    this.reading.scrollTop = 0

    for (const [id, button] of this.buttons) {
      const selected = id === part.id
      button.classList.toggle('is-selected', selected)
      button.setAttribute('aria-pressed', selected ? 'true' : 'false')
    }
  }
}
