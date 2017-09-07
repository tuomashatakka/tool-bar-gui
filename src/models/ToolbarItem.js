'use babel'
import { composeCallback } from '../dispatch'


export default class ToolbarItem {
  constructor (action) {
    let properties = {}
    for (let [ key, value ] of action.properties.entries())
      properties[key] = { value }
    Object.defineProperties(this, properties)
  }
  get callback () {
    let fn = composeCallback(this.command)
    console.log(fn)
    return fn
  }
  get priority () {
    return this.position
  }
}
