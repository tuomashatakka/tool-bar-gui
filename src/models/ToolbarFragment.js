'use babel'
import self from 'autobind-decorator'
import ToolbarAction from './ToolbarAction'
import { Emitter } from 'atom'

const packageName     = 'tool-bar-gui'

const descriptor      = (...parts) => parts.filter(o => o).join('.')

const orderByPosition = (a, b) => {
  let pos_a = a.properties.get('position')
  let pos_b = b.properties.get('position')
  return (
    pos_a > pos_b ? +1 :
    pos_a < pos_b ? -1 :
    0
  )
}

const deserializeItem = entry => ToolbarAction.deserialize(entry)

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
  }

  get entries () {
    let entries = [ ...this.set ].map(item => item.toButton())
    return entries
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
        resolved.add(item)
    return resolved
  }

  findByProperty (property, value=null) {
    for (let item of this.set) {
      let propValue = item.properties.get(property)
      if ((!value && propValue) || (value && propValue === value))
        return item
    }
  }

  moveUp (item) {
    let from = item.properties.get('position')
    let to   = from < 1 ? 0 : from - 1
    let swap = this.findByProperty('position', to)
    item.properties.set('position', to)
    swap.properties.set('position', from)
  }

  moveDown (item) {
    let from = item.properties.get('position')
    let to   = from > this.set.size - 1 ? this.set.size : from + 1
    let swap = this.findByProperty('position', to)
    item.properties.set('position', to)
    swap.properties.set('position', from)
  }

  switchPositions (item1, item2) {
    let pos1 = item1.properties.get('position')
    let pos2 = item2.properties.get('position')
    item1.properties.set('position', pos2)
    item2.properties.set('position', pos1)
  }

  add = (...items) =>
    items.forEach(item => {
      if (!item.properties.get('position'))
        item.properties.set('position', this.set.size)
      if (!this.has(item))
        this.set.add(item)
    })

  has = (...items) =>
    items.reduce((res, item) => res && this.get(item).size > 0, false)

  delete = (...items) =>
    items.forEach(item => this.set.delete(item))
    || this

  update = (...items) =>
    this.delete(...items) || this.add(...items)
    || this

  save      = (path) => {
    console.log(path) // FIXME: Remove

    atom.config.set(descriptor(path), this.toJSON(false)) }

  toJSON    = (json=true) =>
    Array.from(this.set).sort(orderByPosition).map(serializeItem(json))

  serialize = () => ({
    deserializer: 'EntrySet',
    entries: this.toJSON(),
  })

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

  redrawItems () {
    this.toolbar.removeItems()
    this.items.entries.forEach(this.toolbar.addButton.bind(this.toolbar))
  }

  getConfigKey = (key=null) => descriptor(packageName, this.meta.name, key)
  readFromConfig = (key) => atom.config.get(this.getConfigKey(key))

  get meta () {
    return fragments.meta.get(this)
  }

  get items () {
    if (!this.entrySet){
      let items = this.readFromConfig('items')
      this.entrySet = EntrySet.from(items)
    }
    return this.entrySet
  }

  @self
  addItem (item) {
    assertAction(item)
    let items = this.items
    items.add(item)
    this.items.save(this.getConfigKey('items'))
    this.emit('did-add-item', this.items.getOne(item))
  }

  @self
  removeItem (item) {
    this.items.delete(item)
    this.emit('did-remove-item', this.items)
  }

  @self
  moveItem (from, to) {
    to = (to >= from) ? to - 1 : to
    let method = to > from ? 'moveDown' : 'moveUp'
    let maxIterations = 1000
    let item = this.items.findByProperty('position', from)
    let pos  = () => item.properties.get('position')

    while (pos() !== to && maxIterations --> 0)
      this.items[method](item)

    this.emit('did-reorder-items', { item, from, to, items: this.items })
  }

  getTitle = () => 'Manage toolbar buttons'

  onDidAddItem = (callback) => { this.on('did-add-item', callback) }
  onDidRemoveItem = (callback) => { this.on('did-remove-item', callback) }
  onDidReorderItems = (callback) => { this.on('did-reorder-items', callback) }

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
