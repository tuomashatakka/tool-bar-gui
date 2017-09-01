'use babel'
import PaletteView from './PaletteView'
import { dom } from 'edm'
const { make: element } = dom

export default class Panel {

  static URI = 'tool-bar-gui://palette/swatch-panel'
  static title = 'Add Toolbar Button'

  constructor (name) {
    this.name = name
    this.item = createView.call(this)
  }

  getElement () {
    return this.item
  }

  getTitle () {
    return this.title || Panel.title
  }

  getURI() {
    return Panel.URI + '/' + this.name
  }

  getDefaultLocation() {
    return 'right'
  }

  getAllowedLocations() {
    return ['center', 'bottom', 'top', 'right', 'left']
  }

  open () {
    atom.workspace.open(this)
  }

  close () {
    atom.workspace.hide(this)
  }

  toggle () {
    atom.workspace.toggle(this)
  }

  destroy () {
    if (this.item)
      this.item.remove()
  }
}

function createView () {

  let title   = element({ type: 'h3', content: this.getTitle() })
  let palette = element({ type: PaletteView.tag })

  let header  = element({
    tag:      'header',
    class:    'panel-header',
    content:  [ title ] })

  let container = element({
    tag:      'div',
    class:    'rainbow-panel tool-panel padded',
    content:  [ header, palette ] })

  this.paletteView = palette
  return container
}
