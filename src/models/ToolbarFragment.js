'use babel'
import self from 'autobind-decorator'
import ToolbarAction from './ToolbarAction'
import { Emitter } from 'atom'
import { clearScripts } from '../filesystem'

const packageName     = 'tool-bar-gui'

const descriptor      = (...parts) =>
  parts.filter(o => o).join('.')

const orderByPosition = (a, b) => {
  let pos_a = a.properties.get('position')
  let pos_b = b.properties.get('position')
  return (
    pos_a > pos_b ? +1 :
    pos_a < pos_b ? -1 :
    0
  )
}

const deserializeItem = entry =>
  ToolbarAction.deserialize(entry)

const serializeItem   = json => json
  ? entry => entry.toJSON()
  : entry => entry.serialize()


class EntrySet {

  static deserialize (...entries) {
    let item = new EntrySet()
    item.add(...entries.map(deserializeItem))
    return item
  }

  static from (entries=[]) {
    return EntrySet.deserialize(...entries)
  }

  constructor () {
    this.set = new Set()
    clearScripts()
  }

  getOne = (item) => {
    let i = [ ...this.get(item) ]
    return i.length ? i[0] : null
  }

  get = (...items) => {
    let key      = 'tooltip'
    let keys     = items.map(item => item.properties.get(key))
    let resolved = new Set()
    for (let item of this.set)
      if (keys.indexOf(item.properties.get(key)) > -1)
        if (items.length > 1)
          resolved.add(item)
        else
          return item
    return resolved
  }

  findByProperty (property, value=null) {
    for (let item of this.set) {
      if (!item) {
        this.delete(item)
        continue
      }
      let propValue = item.properties.get(property)
      if ((!value && propValue) || (value && propValue === value))
        return item
    }
  }

  reassignPositions () {
    let n = 0
    for (let item of this.set) {
      console.log(n, item)
      item.properties.set('position', n++)
    }
  }

  add = (...items) =>
    items.forEach(item => {
      item = deserializeItem(item)
      if (!item.properties.get('position'))
        item.properties.set('position', this.set.size)
      if (!this.has(item))
        this.set.add(item)
    })

  has = (...items) =>
    items.reduce((res, item) => res && this.get(item).size > 0, false)

  delete = (...items) => {
    items.forEach(item => this.set.delete(item))
    return this
  }

  update = (...items) =>
    this.delete(...items) || this.add(...items)
    || this

  save (path) {
    console.log(path) // FIXME: Remove
    atom.config.set(descriptor(path), this.toJSON(false))
  }

  toArray   = () => {
    let sorted = Array.from(this.set).sort(orderByPosition)
    return sorted
  }

  get entries () {
    let entries = this.toArray().map(item => item.toButton())
    return entries
  }

  toJSON    = (json=true) =>
    this.toArray().map(serializeItem(json))

  serialize = () => ({
    deserializer: 'EntrySet',
    entries: this.toJSON(),
  })

  getPositions () {
    return this.toArray().map(item => item.properties.get('position'))
  }

}

export let fragments = {
  entries: new Array(),
  meta:    new WeakMap(),
}

export default class ToolbarFragment extends Emitter {

  constructor (toolbar, meta) {
    super()
    fragments.entries.push(this)
    fragments.meta.set(this, meta)
    Object.defineProperty(this, 'toolbar', { get: () => toolbar })

    this.onDidAddItem(button => toolbar.addButton(button))
    this.onDidAddItem(button => console.log("button added:", button))
    this.onDidRemoveItem(() => this.redrawItems())
    this.onDidReorderItems(() => this.redrawItems())
    this.redrawItems()
  }

  map (fn) {
    return this.items.entries.map(fn)
  }

  redrawItems () {
    let addToolbarButton = this.toolbar.addButton.bind(this.toolbar)
    this.toolbar.removeItems()
    this.map(addToolbarButton)
  }

  getConfigKey = (key=null) => descriptor(packageName, this.meta.name, key)

  readFromConfig = (key) => atom.config.get(this.getConfigKey(key))

  get meta () {
    return fragments.meta.get(this)
  }

  get items () {
    if (!this.entrySet)
      this.entrySet = EntrySet.from(this.readFromConfig('items'))
    return this.entrySet
  }

  @self
  save () {
    this.items.save(
      this.getConfigKey('items'))
  }

  @self
  addItem (item) {
    assertAction(item)
    this.items.add(item)
    this.emit('did-add-item', item)
    this.save()
  }

  @self
  removeItem (item) {
    assertAction(item)
    this.items.delete(item)
    this.items.reassignPositions()
    this.emit('did-remove-item', this.items)
    this.save()
  }

  @self
  moveItem (item, to) {
    let from     = item.properties.get('position')
    let entries  = this.items.toArray().slice(Math.min(from, to), Math.max(from, to))
    let amount   = to - from
    let moveItem = (item, d) =>
      item.properties.set('position',
      item.properties.get('position') + d)
    let transpose = amount > 0 ?
      item => moveItem(item, -1) :
      item => moveItem(item, 1)

    // Translate items to new positions
    entries.forEach(transpose)
    moveItem(item, amount)

    // Update the toolbar
    this.redrawItems()
    this.emit('did-reorder-items', { item, from, to, items: this.items })
  }

  getTitle = () => 'Manage toolbar buttons'

  onDidAddItem = (callback) => this.on('did-add-item', callback)

  onDidRemoveItem = (callback) => this.on('did-remove-item', callback)

  onDidReorderItems = (callback) => this.on('did-reorder-items', callback)

  @self
  serialize () {
    return {
      deserializer: 'ToolbarFragment',
      items:  this.items.serialize(),
      name: this.toolbar.group,
    }
  }

  static deserialize (state={}) {
    return new ToolbarFragment(state)
  }
}

function assertAction (item) {
  if (!(item instanceof ToolbarAction))
    throw new ReferenceError(`
      Trying to perform a mutation on an EntrySet instance
      with an item not of type \`ToolbarAction\`.
    `)
}
