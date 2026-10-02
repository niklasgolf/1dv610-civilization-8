import { marked } from 'marked'

export type BookPart = {
  id: string
  title: string
  markdown: string
}

const partFiles = import.meta.glob('../md-files/part-*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const partHeading = /^#{1,6} \*\*(Part [^*]+)\*\*/m

export function loadBookParts(): BookPart[] {
  return Object.entries(partFiles)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([filePath, markdown]) => {
      const source = markdown as string
      const fileName = filePath.split('/').pop() ?? filePath
      const heading = source.match(partHeading)

      return {
        id: fileName.replace(/\.md$/, ''),
        title: heading?.[1]?.trim() ?? fileName,
        markdown: source,
      }
    })
}

export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false })
}
