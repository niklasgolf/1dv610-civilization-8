import './style.css'
import { WorldBuilder } from './editor/world-builder.ts'

const root = document.querySelector('#app')

if (!(root instanceof HTMLElement)) {
  throw new Error('Could not find the #app element.')
}

new WorldBuilder(root)
