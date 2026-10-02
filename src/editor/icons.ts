import { appendSvg, createSvg } from '../graphics/primitives/svg.ts'

const POINTY_HEX = 'M12 2.2 20.4 7.1 20.4 16.9 12 21.8 3.6 16.9 3.6 7.1Z'

let clipSerial = 0

function nextClipId(): string {
  clipSerial += 1
  return `icon-clip-${clipSerial}`
}

function hex(parent: SVGElement, fill: string): void {
  appendSvg(parent, 'path', {
    d: POINTY_HEX,
    fill,
    stroke: 'rgba(7, 17, 28, 0.55)',
    'stroke-width': '0.7',
    'stroke-linejoin': 'round',
  })
}

function stroke(
  parent: SVGElement,
  d: string,
  color = 'currentColor',
  width = '1.6',
): void {
  appendSvg(parent, 'path', {
    d,
    fill: 'none',
    stroke: color,
    'stroke-width': width,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  })
}

function tree(
  parent: SVGElement,
  cx: number,
  top: number,
  width: number,
  height: number,
  color: string,
): void {
  const base = top + height
  appendSvg(parent, 'path', {
    d: `M${cx} ${top} L${cx + width / 2} ${base} H${cx - width / 2}Z`,
    fill: color,
  })
  appendSvg(parent, 'rect', {
    x: String(cx - 0.8),
    y: String(base),
    width: '1.6',
    height: '2.2',
    fill: '#6a4630',
  })
}

function grass(parent: SVGSVGElement): void {
  hex(parent, '#3e8f46')
  stroke(parent, 'M9 16.5c.2-3 .4-4.2-.2-7', '#173d22', '1.2')
  stroke(parent, 'M12 17.2c.2-3.4.6-5-.1-8.2', '#173d22', '1.2')
  stroke(parent, 'M15 16.4c.1-2.6.5-3.8-.1-6.4', '#173d22', '1.2')
}

function plains(parent: SVGSVGElement): void {
  hex(parent, '#c6a15a')
  stroke(parent, 'M7 10.5h10M7.5 13h9M8 15.5h8', '#7a5b28', '1.1')
}

function desert(parent: SVGSVGElement): void {
  hex(parent, '#d2b07a')
  stroke(parent, 'M6 12c2-2 4-2 6 0s4 2 6 0', '#8a6840', '1.2')
  stroke(parent, 'M7 15.5c1.6-1.4 3.2-1.4 4.8 0s3.2 1.4 4.8 0', '#8a6840', '1.2')
}

function tundra(parent: SVGSVGElement): void {
  hex(parent, '#8d9a78')
  appendSvg(parent, 'circle', { cx: '9', cy: '12', r: '1', fill: '#4d5a40' })
  appendSvg(parent, 'circle', { cx: '13', cy: '14.5', r: '1.1', fill: '#4d5a40' })
  appendSvg(parent, 'circle', { cx: '15.5', cy: '10.5', r: '0.8', fill: '#4d5a40' })
}

function snow(parent: SVGSVGElement): void {
  hex(parent, '#e7eef3')
  stroke(parent, 'M12 8v8M8.5 10l7 4M8.5 14l7-4', '#8aa4b8', '1.1')
}

function coast(parent: SVGSVGElement): void {
  const clipId = nextClipId()
  const defs = appendSvg(parent, 'defs')
  const clip = appendSvg(defs, 'clipPath', { id: clipId })
  appendSvg(clip, 'path', { d: POINTY_HEX })
  hex(parent, '#e2d0a8')
  appendSvg(parent, 'path', {
    d: 'M0 0H24V12.2C18.5 10.4 15 14.2 10 12.6 7 11.6 4 12.2 0 14.2Z',
    fill: '#3e97be',
    'clip-path': `url(#${clipId})`,
  })
  stroke(parent, 'M4 12.4c2.2-1.2 3.6-.4 5.4.6 2 1.1 3.4.2 5.6-1', '#d7efe8', '1')
}

function ocean(parent: SVGSVGElement): void {
  hex(parent, '#1d6284')
  stroke(parent, 'M6.5 10.5c1.6 1.2 2.8 1.2 4.4 0s2.8-1.2 4.4 0 2.8 1.2 2.2 0', '#9ad4ea', '1.1')
  stroke(parent, 'M6.5 14.2c1.6 1.2 2.8 1.2 4.4 0s2.8-1.2 4.4 0 2.8 1.2 2.2 0', '#9ad4ea', '1.1')
}

function woods(parent: SVGSVGElement): void {
  tree(parent, 9, 6, 8, 11, '#2f8f49')
  tree(parent, 15.5, 8, 7, 9, '#226c38')
}

function rainforest(parent: SVGSVGElement): void {
  tree(parent, 7.5, 8, 6.5, 9, '#1d6a3c')
  tree(parent, 12, 5, 8, 12, '#145232')
  tree(parent, 17, 9, 6, 8, '#1d6a3c')
  appendSvg(parent, 'circle', { cx: '19', cy: '6', r: '1', fill: '#7ec8e8' })
}

function marsh(parent: SVGSVGElement): void {
  stroke(parent, 'M4 16c2 1 3 1 5 0s3-1 5 0 3 1 5 0', '#67b4cf', '1.3')
  stroke(parent, 'M5 19c2 1 3 1 5 0s3-1 5 0 3 1 4 0', '#67b4cf', '1.3')
  stroke(parent, 'M8 15c.2-4 .3-6-.4-9', '#6d9148', '1.3')
  stroke(parent, 'M12 16c.2-5 .4-7-.2-10', '#6d9148', '1.3')
  stroke(parent, 'M16 15.5c.2-3.5.3-5-.3-8', '#6d9148', '1.3')
}

function oasis(parent: SVGSVGElement): void {
  appendSvg(parent, 'ellipse', {
    cx: '12',
    cy: '16.5',
    rx: '6.5',
    ry: '2.6',
    fill: '#3d93b8',
  })
  stroke(parent, 'M12 16c.4-3 .2-6 .8-9', '#8a5a34', '1.5')
  stroke(parent, 'M12.6 8C10 6.5 8 7.5 6.5 6.2', '#2f8f49', '1.4')
  stroke(parent, 'M12.6 8C15 5.8 17.5 6.5 19 5.2', '#2f8f49', '1.4')
  stroke(parent, 'M12.6 8.4C12 5.5 13.5 4 15.5 3.2', '#2f8f49', '1.4')
}

function floodplains(parent: SVGSVGElement): void {
  stroke(parent, 'M4 8c2 1.2 3.2 1.2 5.2 0S12.4 6.8 14.4 8s3.2 1.2 5.2 0', '#c4a36a', '1.3')
  stroke(parent, 'M4 12c2 1.2 3.2 1.2 5.2 0S12.4 10.8 14.4 12s3.2 1.2 5.2 0', '#c4a36a', '1.3')
  stroke(parent, 'M4 16c2 1.2 3.2 1.2 5.2 0S12.4 14.8 14.4 16s3.2 1.2 5.2 0', '#c4a36a', '1.3')
}

function ice(parent: SVGSVGElement): void {
  appendSvg(parent, 'path', {
    d: 'M12 3.2 20 12 12 20.8 4 12Z',
    fill: '#d7f0f8',
    stroke: '#7eb4cc',
    'stroke-width': '1.2',
    'stroke-linejoin': 'round',
  })
  stroke(parent, 'M12 7.2 16 12 12 16.8 8 12Z', '#7eb4cc', '1.1')
}

function reef(parent: SVGSVGElement): void {
  stroke(parent, 'M12 19 V8', '#e07a68', '1.8')
  stroke(parent, 'M12 12c-3-1-4-3-4-5', '#e07a68', '1.6')
  stroke(parent, 'M12 10c3-1 5-2 6-4', '#f0b090', '1.6')
  stroke(parent, 'M12 15c-3 .2-5 2-6 4', '#f0b090', '1.6')
  stroke(parent, 'M12 14c3 .4 4 2 5 4', '#e07a68', '1.6')
  appendSvg(parent, 'circle', { cx: '8', cy: '7', r: '1.1', fill: '#f0b090' })
  appendSvg(parent, 'circle', { cx: '18', cy: '6', r: '1.1', fill: '#e07a68' })
}

function volcano(parent: SVGSVGElement): void {
  appendSvg(parent, 'path', {
    d: 'M3.5 19.5 12 6l8.5 13.5Z',
    fill: '#6d5344',
  })
  appendSvg(parent, 'path', {
    d: 'M9.8 19.5 12 13l2.2 6.5Z',
    fill: '#d4543c',
  })
  appendSvg(parent, 'circle', { cx: '10', cy: '5.5', r: '1.3', fill: '#c9d3dc', opacity: '0.85' })
  appendSvg(parent, 'circle', { cx: '13.5', cy: '4', r: '1.7', fill: '#d5dee6', opacity: '0.9' })
}

function river(parent: SVGSVGElement): void {
  stroke(parent, 'M5 19C8 15 8 13 12 12s5-3 7-8', '#7ec8e3', '2.2')
}

function riverSource(parent: SVGSVGElement): void {
  appendSvg(parent, 'circle', { cx: '8', cy: '8', r: '2.3', fill: '#7ec8e3' })
  stroke(parent, 'M10 9.2C12 12 13 14 12 19', '#7ec8e3', '2')
}

function riverMouth(parent: SVGSVGElement): void {
  stroke(parent, 'M6 6c2 4 3 6 3 9', '#7ec8e3', '2')
  appendSvg(parent, 'path', {
    d: 'M9 15c2 2 4 3 8 3-3 1.2-5 2.4-8 3.2.8-2 1-4 0-6.2Z',
    fill: '#7ec8e3',
  })
}

function brush(parent: SVGSVGElement, radius: number): void {
  appendSvg(parent, 'circle', {
    cx: '10',
    cy: '14.5',
    r: String(radius),
    fill: 'currentColor',
  })
  stroke(parent, 'M13.2 11.2 19 5.2', 'currentColor', '1.8')
  stroke(parent, 'M16.8 4.2 20 7.4', 'currentColor', '1.8')
}

function drawUndo(parent: SVGElement): void {
  stroke(parent, 'M9 7.5 4.5 12 9 16.5')
  stroke(parent, 'M6 12h8.2')
  stroke(parent, 'M14.2 12a4.2 4.2 0 1 0-1.2-8.2')
}

function undo(parent: SVGSVGElement): void {
  drawUndo(parent)
}

function redo(parent: SVGSVGElement): void {
  const mirrored = appendSvg(parent, 'g', {
    transform: 'translate(24 0) scale(-1 1)',
  })
  drawUndo(mirrored)
}

function pyramid(parent: SVGSVGElement): void {
  stroke(parent, 'M12 4.5 21 19.5H3Z', 'currentColor', '1.5')
  stroke(parent, 'M7.2 13.2h9.6M9.4 16.4h5.2M12 4.5v15', 'currentColor', '1.2')
}

function colossus(parent: SVGSVGElement): void {
  appendSvg(parent, 'circle', { cx: '11', cy: '5.5', r: '2.1', fill: 'currentColor' })
  appendSvg(parent, 'path', {
    d: 'M8 11.2 7.2 20h7.6l-.8-8.8Z',
    fill: 'currentColor',
  })
  stroke(parent, 'M13 12.5 18.5 7.5', 'currentColor', '1.7')
  appendSvg(parent, 'circle', { cx: '19.2', cy: '6.4', r: '1.2', fill: '#e2c27a' })
  stroke(parent, 'M6 20.5h12', 'currentColor', '1.4')
}

function lighthouse(parent: SVGSVGElement): void {
  stroke(parent, 'M12 6.5 5 3.2M12 6.5 19 3.2', '#e2c27a', '1.3')
  appendSvg(parent, 'path', {
    d: 'M10.2 8h3.6l.8 11H9.4Z',
    fill: 'currentColor',
  })
  appendSvg(parent, 'path', {
    d: 'M9.2 8 12 4.2 14.8 8Z',
    fill: '#e2c27a',
  })
  stroke(parent, 'M8 19.8h8', 'currentColor', '1.6')
}

function temple(parent: SVGSVGElement): void {
  stroke(parent, 'M3.5 9.5 12 3.5l8.5 6')
  stroke(parent, 'M4.5 9.5h15')
  stroke(parent, 'M7 9.5v9M10.5 9.5v9M13.5 9.5v9M17 9.5v9')
  stroke(parent, 'M4.5 18.8h15')
}

function gardens(parent: SVGSVGElement): void {
  appendSvg(parent, 'rect', {
    x: '3.5',
    y: '7',
    width: '17',
    height: '12',
    rx: '1.5',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.5',
  })
  tree(parent, 12, 8.5, 6, 7, '#2f8f49')
}

function observatory(parent: SVGSVGElement): void {
  stroke(parent, 'M5 14a7 7 0 0 1 14 0')
  appendSvg(parent, 'rect', {
    x: '7',
    y: '14',
    width: '10',
    height: '5.5',
    fill: 'currentColor',
  })
  appendSvg(parent, 'circle', { cx: '12', cy: '11.2', r: '1.1', fill: '#e2c27a' })
}

function continent(parent: SVGSVGElement, color: string): void {
  hex(parent, color)
  appendSvg(parent, 'circle', {
    cx: '12',
    cy: '12',
    r: '2.1',
    fill: 'rgba(255,255,255,0.35)',
  })
}

function wheat(parent: SVGSVGElement): void {
  stroke(parent, 'M12 20 V6', '#d7b15a', '1.4')
  stroke(parent, 'M12 9c-2-1.5-3-1.2-3.5.2M12 9c2-1.5 3-1.2 3.5.2', '#d7b15a', '1.3')
  stroke(parent, 'M12 13c-2-1.5-3-1.2-3.5.2M12 13c2-1.5 3-1.2 3.5.2', '#d7b15a', '1.3')
  stroke(parent, 'M12 17c-2-1.5-3-1.2-3.5.2M12 17c2-1.5 3-1.2 3.5.2', '#d7b15a', '1.3')
}

function cattle(parent: SVGSVGElement): void {
  appendSvg(parent, 'ellipse', {
    cx: '12',
    cy: '14',
    rx: '6.2',
    ry: '3.6',
    fill: '#8b5a38',
  })
  appendSvg(parent, 'circle', { cx: '7.2', cy: '12.2', r: '2.3', fill: '#8b5a38' })
  stroke(parent, 'M5.4 11 4 8.2M7.6 10.4 8.4 7.6', '#8b5a38', '1.2')
  appendSvg(parent, 'circle', { cx: '6.4', cy: '12', r: '0.45', fill: '#1b120c' })
  stroke(parent, 'M8 17.2v3M11 17.4v3M14 17.4v3M17 17v3', '#8b5a38', '1.3')
}

function horses(parent: SVGSVGElement): void {
  appendSvg(parent, 'path', {
    d: 'M4.5 14.5c.4-3 2.4-5 5-5 0-2.2 1.4-3.6 3.2-3.2-.6 1.4-.2 2.2 1.3 2.4 1.8.2 3.2-1.2 4.2-2.2-.2 2.4 1.2 3.6.2 5.6-.8 1.6-2.2 2.4-3.6 2.4H8.2c-2.2 0-3.8-.6-3.7 0Z',
    fill: '#6e4b32',
  })
  stroke(parent, 'M7 16.8v3.2M10.5 16.8v3.2M14.2 16.6v3.4M17.2 16.2v3.4', '#6e4b32', '1.3')
  appendSvg(parent, 'circle', { cx: '15.6', cy: '10.2', r: '0.45', fill: '#f3ead7' })
}

function deer(parent: SVGSVGElement): void {
  appendSvg(parent, 'ellipse', {
    cx: '12',
    cy: '15',
    rx: '5.5',
    ry: '3',
    fill: '#a67c52',
  })
  appendSvg(parent, 'circle', { cx: '16.5', cy: '12.5', r: '2', fill: '#a67c52' })
  stroke(parent, 'M15.2 10.8 14 6.5M15.2 10.8 17.5 6.2M14 6.5 12.6 5M17.5 6.2 19 4.6', '#a67c52', '1.2')
  stroke(parent, 'M8 17.6v2.8M11 17.8v2.8M14 17.6v2.8', '#a67c52', '1.2')
}

function fish(parent: SVGSVGElement): void {
  appendSvg(parent, 'path', {
    d: 'M3.5 12c3-3 7-3.4 11-1.2L20 7.2v9.6l-5.5-3.6c-4 2.2-8 1.8-11-1.2Z',
    fill: '#5eb0d4',
  })
  appendSvg(parent, 'circle', { cx: '8', cy: '11.4', r: '0.7', fill: '#102028' })
}

function stone(parent: SVGSVGElement): void {
  appendSvg(parent, 'path', {
    d: 'M5 16.5 7.2 11h4.2l1.4 5.5Z',
    fill: '#9aa3ad',
  })
  appendSvg(parent, 'path', {
    d: 'M11 17.5 13 10.5h5.2L20 17.5Z',
    fill: '#b7c0c8',
  })
  appendSvg(parent, 'path', {
    d: 'M8 18.8 10.2 14h4.4l1.6 4.8Z',
    fill: '#7e888f',
  })
}

function iron(parent: SVGSVGElement): void {
  appendSvg(parent, 'path', {
    d: 'M4.5 14.5 8 10h10l3.5 4.5V18H4.5Z',
    fill: '#8d98a3',
  })
  stroke(parent, 'M8 10 9.2 14.5M18 10l-1.2 4.5M4.5 14.5h15', '#d5dde4', '1')
}

function gold(parent: SVGSVGElement): void {
  appendSvg(parent, 'ellipse', { cx: '12', cy: '15', rx: '6', ry: '2.3', fill: '#c4962e' })
  appendSvg(parent, 'ellipse', { cx: '12', cy: '12.2', rx: '6', ry: '2.3', fill: '#e6c35c' })
  appendSvg(parent, 'ellipse', { cx: '12', cy: '9.4', rx: '6', ry: '2.3', fill: '#f0d78a' })
  stroke(parent, 'M8 9.4c1.2.8 2.6.8 4 0s2.8-.8 4 0', '#a8842a', '0.8')
}

function farm(parent: SVGSVGElement): void {
  stroke(parent, 'M4 18h16', '#8a6234', '1.4')
  stroke(parent, 'M7 18V8M12 18V6M17 18V9', '#d7b15a', '1.3')
  stroke(parent, 'M7 11c-1.6-1-2.2-.6-2.4.6M7 11c1.6-1 2.2-.6 2.4.6', '#d7b15a', '1.1')
  stroke(parent, 'M12 10c-1.6-1-2.2-.6-2.4.6M12 10c1.6-1 2.2-.6 2.4.6', '#d7b15a', '1.1')
  stroke(parent, 'M17 12c-1.6-1-2.2-.6-2.4.6M17 12c1.6-1 2.2-.6 2.4.6', '#d7b15a', '1.1')
}

function mine(parent: SVGSVGElement): void {
  stroke(parent, 'M5 19 16 8', 'currentColor', '1.8')
  stroke(parent, 'M14 6.2 19.2 8.4 16.2 11.2Z', 'currentColor', '1.4')
  stroke(parent, 'M13.2 9.2 17.6 6', '#e2c27a', '1.6')
}

function quarry(parent: SVGSVGElement): void {
  appendSvg(parent, 'rect', { x: '4', y: '12', width: '7', height: '6', fill: '#9aa3ad' })
  appendSvg(parent, 'rect', { x: '12', y: '12', width: '7', height: '6', fill: '#b7c0c8' })
  appendSvg(parent, 'rect', { x: '8', y: '6', width: '7', height: '6', fill: '#d0d6dc' })
}

function camp(parent: SVGSVGElement): void {
  appendSvg(parent, 'path', {
    d: 'M3.5 19 12 5.5 20.5 19Z',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.6',
    'stroke-linejoin': 'round',
  })
  stroke(parent, 'M12 19 V11', 'currentColor', '1.4')
  stroke(parent, 'M9.2 19 12 13.5 14.8 19', 'currentColor', '1.2')
}

function pasture(parent: SVGSVGElement): void {
  stroke(parent, 'M4 10h16M4 15h16', 'currentColor', '1.5')
  stroke(parent, 'M7 7.5v12M12 7.5v12M17 7.5v12', 'currentColor', '1.5')
}

function fishing(parent: SVGSVGElement): void {
  appendSvg(parent, 'path', {
    d: 'M4 15h14l-2 4H6Z',
    fill: 'currentColor',
  })
  stroke(parent, 'M11 15 V7', 'currentColor', '1.4')
  stroke(parent, 'M11 8h5', '#e2c27a', '1.3')
}

function plantation(parent: SVGSVGElement): void {
  tree(parent, 7, 8, 5, 8, '#2f8f49')
  tree(parent, 12, 6, 5.5, 10, '#226c38')
  tree(parent, 17, 8.5, 5, 7.5, '#2f8f49')
}

function fort(parent: SVGSVGElement): void {
  appendSvg(parent, 'path', {
    d: 'M4 19V10h3V7h3v3h4V7h3v3h3v9Z',
    fill: 'currentColor',
  })
  stroke(parent, 'M4 14.5h16', '#102033', '1.2')
}

const drawers = {
  grass,
  plains,
  desert,
  tundra,
  snow,
  coast,
  ocean,
  woods,
  rainforest,
  marsh,
  oasis,
  floodplains,
  ice,
  reef,
  volcano,
  river,
  'river-source': riverSource,
  'river-mouth': riverMouth,
  'brush-small': (parent: SVGSVGElement) => brush(parent, 2.1),
  'brush-medium': (parent: SVGSVGElement) => brush(parent, 3.4),
  'brush-large': (parent: SVGSVGElement) => brush(parent, 5),
  undo,
  redo,
  pyramid,
  colossus,
  lighthouse,
  temple,
  gardens,
  observatory,
  'continent-crimson': (parent: SVGSVGElement) => continent(parent, '#c4493a'),
  'continent-blue': (parent: SVGSVGElement) => continent(parent, '#3d7ec4'),
  'continent-green': (parent: SVGSVGElement) => continent(parent, '#3e9a55'),
  'continent-gold': (parent: SVGSVGElement) => continent(parent, '#d4a017'),
  'continent-purple': (parent: SVGSVGElement) => continent(parent, '#7a5cad'),
  'continent-orange': (parent: SVGSVGElement) => continent(parent, '#d47a2a'),
  wheat,
  cattle,
  horses,
  deer,
  fish,
  stone,
  iron,
  gold,
  farm,
  mine,
  quarry,
  camp,
  pasture,
  fishing,
  plantation,
  fort,
}

export type IconName = keyof typeof drawers

export function createIcon(name: IconName): SVGSVGElement {
  const icon = createSvg('svg', {
    viewBox: '0 0 24 24',
    class: 'tool-icon',
    'aria-hidden': 'true',
    fill: 'none',
  })
  drawers[name](icon)
  return icon
}
