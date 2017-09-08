'use babel'
import { composeCallback } from '../dispatch'
import self from 'autobind-decorator'


export default class ToolbarItem {


  constructor (action) {
    let properties = {}
    for (let [ key, value ] of action.properties.entries())
      properties[key] = { value }
    Object.defineProperties(this, properties)
    this._callback = composeCallback(this.command, this)
    console.log("toolbar item:", this, this._callback)
  }


  @self
  callback () {

    try {
      return this._callback() }

    catch (description) {
      atom.notifications.addWarning("Could not execute the callback", { description }) }

  }


  get priority () {
    return this.position
  }
}
