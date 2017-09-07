'use babel'

import { Disposable } from 'atom'


export default class PaneItemElement extends Disposable {

  constructor(title) {
    let disposalAction = () => this.item.remove()

    super(disposalAction)

    this.item    = document.createElement('div')
    this.title   = title
    this.element = this.item
    // Remove old elements
    // document.querySelectorAll('.' + this.className)
    //   .forEach(o => o.remove())
  }

  getTitle = () =>
    this.title

  getItem = () =>
    this.item

  getAllowedLocations = () =>
    ['left', 'right', 'bottom', ]

  getPreferredLocation = () =>
    this.getAllowedLocations()[0]

  getPreferredWidth = () =>
    240

  getURI = () =>
    'atom://tool-bar/edit'

  toggle = () =>
    atom.workspace.toggle(this)

  show = () =>
    atom.workspace.show(this)

  hide = () =>
    atom.workspace.hide(this)

}
