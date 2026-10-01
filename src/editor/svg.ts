export const SVG_NS = 'http://www.w3.org/2000/svg'

export function createSvg<K extends keyof SVGElementTagNameMap>(
  name: K,
  attributes: Record<string, string> = {},
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NS, name)

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value)
  }

  return element
}

export function appendSvg<K extends keyof SVGElementTagNameMap>(
  parent: SVGElement,
  name: K,
  attributes: Record<string, string> = {},
): SVGElementTagNameMap[K] {
  const element = createSvg(name, attributes)
  parent.append(element)
  return element
}
