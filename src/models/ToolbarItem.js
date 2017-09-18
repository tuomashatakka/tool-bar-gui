'use babel'
import { composeCallback } from '../dispatch'
import self from 'autobind-decorator'


const callbacks = new WeakMap()
const actionsByItem = new WeakMap()


export function getActionByItem (item) {
  return actionsByItem.get(item)
}


export async function getCallbackForItem (item) {
  let callback = callbacks.get(item)
  if (!callback) {
    callback = await composeCallback(item)
    callbacks.set(item. callback)
  }
  return callback
}


export default class ToolbarItem {

  constructor (action) {
    let properties = {}
    for (let [ key, value ] of action.properties.entries())
      properties[key] = { value }

    Object.defineProperties(this, properties)
    actionsByItem.set(this, action)
    callbacks.set(this, )
  }

  @self
  async callback () {
    let callback = await getCallbackForItem(this)
    if (typeof callback === 'function')
      return callback()
  }


  get priority () {
    return this.position
  }
}
