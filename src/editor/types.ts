import type { IconName } from './icons.ts'

export type ToolItem = {
  id: string
  label: string
  icon: IconName
  /**
   * Buttons that share a group highlight as a single choice.
   * Buttons without a group, such as undo, only show hover and press.
   */
  group?: string
}

export type ToolSectionConfig = {
  id: string
  title: string
  items: ToolItem[]
  defaultSelectedId?: string
}

export type ToolPanelConfig = {
  id: string
  label: string
  sections: ToolSectionConfig[]
}

export type PanelSide = 'left' | 'right'
