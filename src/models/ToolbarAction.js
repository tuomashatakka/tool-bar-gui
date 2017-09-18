'use babel'
import { Emitter } from 'atom'
import ToolbarItem from './ToolbarItem'
import self from 'autobind-decorator'
import { getFile } from '../filesystem'
import { activateOrOpenInNewPane } from '../util'


export default class ToolbarAction extends Emitter {

  static deserialize (detail={}) {
    if (detail instanceof ToolbarAction)
      return detail
    let action   = new ToolbarAction()
    Object.defineProperties(action, parseRawData(detail))
    return action
  }

  constructor () {
    super()
    this.properties = new Map()
  }

  @self
  async openScriptFile () {
    let file = await this.file
    return atom.workspace.open(file.getPath())
  }

  get file () {
    return getFile(this.filename)
  }

  get filename () {
    this._filename = (this._filename || this.name).replace(/([^\w]+)/g, '-')
    return this._filename
  }

  get name () {
    let name = this.properties.get('tooltip')
    if (!name) {
      name = this.properties.get('command')
      name = name ? name.substr(0, 12) : null
    }
    return name ? name.replace(/([^\w]+)/g, '-') : null
  }

  get tooltip () {
    return this.properties.get('tooltip')
  }

  get iconset () {
    return this.properties.get('iconset')
  }

  get icon () {
    return this.properties.get('icon')
  }

  getTitle () {
    let name = this.name
    if (!name)
      return 'Add toolbar item'
    return 'Edit toolbar item ' + name
  }

  serialize () {
    let data = { deserializer: 'ToolbarAction' }
    for (let [key, val] of this.properties.entries())
      if (key !== 'position')
        data[key] = val
    return data
  }

  toString () {
    return this.name
  }

  toJSON = () => ({
    icon:     this.properties.get('icon'),
    iconset:  this.properties.get('iconset'),
    tooltip:  this.properties.get('tooltip'),
    command:  this.properties.get('command'),
  })

  toButton () {
    let item = new ToolbarItem(this)
    return item
  }

  static async initialize () {
    let action   = new ToolbarAction()
    let item     = await activateOrOpenInNewPane(action)
    // let pane     = atom.workspace.paneForItem(item)
    let view     = atom.views.getView(action)
    let response = new Promise(resolve => {

      let hide = () => {
        view.removeEventListener('submit', respond)
        view.removeEventListener('cancel', hide)
        atom.workspace.hide(item)
      }

      let respond = ({ detail }) => {
        Object.defineProperties(action, parseRawData(detail))
        resolve(action)
        hide()
      }

      view.addEventListener('submit', respond)
      view.addEventListener('cancel', hide)
      // pane.onDidRemoveItem(respond)
    })
    return await response
  }
}

function parseRawData (detail) {
  let properties  = new Map()
  for (let attr in detail)
    properties.set(attr, detail[attr])
  return { properties: { value: properties } }
}
