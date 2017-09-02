'use babel'
import { Emitter } from 'atom'
import { composeCallback } from '../dispatch'

export default class ToolbarAction extends Emitter {

  static deserialize (detail={}) {
    let action   = new ToolbarAction()
    Object.defineProperties(action, parseRawData(detail))
    return action
  }

  constructor () {
    super()
    this.properties = new Map()
  }

  getTitle () {
    return 'Edit toolbar button'
  }

  serialize () {
    let data = { deserializer: 'ToolbarAction' }
    for (let [key, val] of this.properties.entries())
      data[key] = val
    return data
  }

  toJSON = () => ({
    icon:     this.properties.get('icon'),
    iconset:  this.properties.get('iconset'),
    tooltip:  this.properties.get('tooltip'),
    command:  this.properties.get('command'),
  })

  toButton () {
    return new ToolbarItem(this)
  }

  static async initialize () {
    let action   = new ToolbarAction()
    let item     = await atom.workspace.open(action)
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

export class ToolbarItem {
  constructor (action) {
    let properties = {}
    for (let [ key, value ] of action.properties.entries())
      properties[key] = { value }
    Object.defineProperties(this, properties)
  }
  get callback () {
    let fn = composeCallback(this.command)
    return fn
  }
  get priority () {
    return this.position
  }
}

function parseRawData (detail) {
  let { command } = detail
  let properties  = new Map()
  for (let attr in detail)
    properties.set(attr, detail[attr])
  return {
    properties: { value: properties },
    callback: { value: composeCallback(command, detail) }
  }
}
