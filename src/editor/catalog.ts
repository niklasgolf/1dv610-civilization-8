import type { IconName } from './icons.ts'
import type { ToolItem, ToolPanelConfig, ToolSectionConfig } from './types.ts'

function choices(
  group: string,
  items: Array<{ id: string, label: string, icon: IconName }>,
): ToolItem[] {
  return items.map((item) => ({
    ...item,
    group,
  }))
}

const terrain: ToolSectionConfig = {
  id: 'terrain',
  title: 'Terrain',
  defaultSelectedId: 'grass',
  items: choices('terrain', [
    { id: 'grass', label: 'Grass', icon: 'grass' },
    { id: 'plains', label: 'Plains', icon: 'plains' },
    { id: 'desert', label: 'Desert', icon: 'desert' },
    { id: 'tundra', label: 'Tundra', icon: 'tundra' },
    { id: 'snow', label: 'Snow', icon: 'snow' },
    { id: 'coast', label: 'Coast', icon: 'coast' },
    { id: 'ocean', label: 'Ocean', icon: 'ocean' },
  ]),
}

const features: ToolSectionConfig = {
  id: 'features',
  title: 'Features',
  items: choices('features', [
    { id: 'woods', label: 'Woods', icon: 'woods' },
    { id: 'rainforest', label: 'Rainforest', icon: 'rainforest' },
    { id: 'marsh', label: 'Marsh', icon: 'marsh' },
    { id: 'oasis', label: 'Oasis', icon: 'oasis' },
    { id: 'floodplains', label: 'Floodplains', icon: 'floodplains' },
    { id: 'ice', label: 'Ice', icon: 'ice' },
    { id: 'reef', label: 'Reef', icon: 'reef' },
    { id: 'volcano', label: 'Volcano', icon: 'volcano' },
  ]),
}

const rivers: ToolSectionConfig = {
  id: 'rivers',
  title: 'Rivers',
  items: choices('rivers', [
    { id: 'river', label: 'River', icon: 'river' },
    { id: 'river-source', label: 'River source', icon: 'river-source' },
    { id: 'river-mouth', label: 'River mouth', icon: 'river-mouth' },
  ]),
}

const brush: ToolSectionConfig = {
  id: 'brush',
  title: 'Brush',
  defaultSelectedId: 'brush-medium',
  items: [
    ...choices('brush', [
      { id: 'brush-small', label: 'Small brush', icon: 'brush-small' },
      { id: 'brush-medium', label: 'Medium brush', icon: 'brush-medium' },
      { id: 'brush-large', label: 'Large brush', icon: 'brush-large' },
    ]),
    { id: 'undo', label: 'Undo', icon: 'undo' },
    { id: 'redo', label: 'Redo', icon: 'redo' },
  ],
}

const wonders: ToolSectionConfig = {
  id: 'wonders',
  title: 'Wonders',
  items: choices('wonders', [
    { id: 'pyramid', label: 'Pyramid', icon: 'pyramid' },
    { id: 'colossus', label: 'Colossus', icon: 'colossus' },
    { id: 'lighthouse', label: 'Lighthouse', icon: 'lighthouse' },
    { id: 'temple', label: 'Temple', icon: 'temple' },
    { id: 'gardens', label: 'Gardens', icon: 'gardens' },
    { id: 'observatory', label: 'Observatory', icon: 'observatory' },
  ]),
}

const continents: ToolSectionConfig = {
  id: 'continents',
  title: 'Continents',
  items: choices('continents', [
    { id: 'continent-crimson', label: 'Crimson continent', icon: 'continent-crimson' },
    { id: 'continent-blue', label: 'Blue continent', icon: 'continent-blue' },
    { id: 'continent-green', label: 'Green continent', icon: 'continent-green' },
    { id: 'continent-gold', label: 'Gold continent', icon: 'continent-gold' },
    { id: 'continent-purple', label: 'Purple continent', icon: 'continent-purple' },
    { id: 'continent-orange', label: 'Orange continent', icon: 'continent-orange' },
  ]),
}

const resources: ToolSectionConfig = {
  id: 'resources',
  title: 'Resources',
  items: choices('resources', [
    { id: 'wheat', label: 'Wheat', icon: 'wheat' },
    { id: 'cattle', label: 'Cattle', icon: 'cattle' },
    { id: 'horses', label: 'Horses', icon: 'horses' },
    { id: 'deer', label: 'Deer', icon: 'deer' },
    { id: 'fish', label: 'Fish', icon: 'fish' },
    { id: 'stone', label: 'Stone', icon: 'stone' },
    { id: 'iron', label: 'Iron', icon: 'iron' },
    { id: 'gold', label: 'Gold', icon: 'gold' },
  ]),
}

const improvements: ToolSectionConfig = {
  id: 'improvements',
  title: 'Improvements',
  items: choices('improvements', [
    { id: 'farm', label: 'Farm', icon: 'farm' },
    { id: 'mine', label: 'Mine', icon: 'mine' },
    { id: 'quarry', label: 'Quarry', icon: 'quarry' },
    { id: 'camp', label: 'Camp', icon: 'camp' },
    { id: 'pasture', label: 'Pasture', icon: 'pasture' },
    { id: 'fishing', label: 'Fishing boats', icon: 'fishing' },
    { id: 'plantation', label: 'Plantation', icon: 'plantation' },
    { id: 'fort', label: 'Fort', icon: 'fort' },
  ]),
}

/**
 * Move a section between these two arrays to change which panel shows it.
 * The panels themselves do not hard-code a category.
 */
export const leftTools: ToolPanelConfig = {
  id: 'left-tools',
  label: 'Terrain tools',
  sections: [terrain, features, rivers, brush],
}

export const rightTools: ToolPanelConfig = {
  id: 'right-tools',
  label: 'Placement tools',
  sections: [wonders, continents, resources, improvements],
}
