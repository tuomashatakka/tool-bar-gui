'use babel';

import applyFormFunctionsToHTMLProto from './forms'
import view, { EditView, RemoveView } from './views'
import { composeCallback, setupScripts } from './dispatch'
import { CompositeDisposable } from 'atom'

const PACK = 'tool-bar-gui'

const defaults = {
  priority: 1,
  tooltip: '',
  icon: '',
  iconset: 'ion',
  callback: function () { console.warn(arguments) },
}

let toolbar, views, items = [], toolbarName = PACK

export default {

  subscriptions: null,
  buttons: [],

  activate(state) {
    // Register a command for toggling
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tool-bar-gui:toggle': () => this.insertDevButtons(),
    }))

    applyFormFunctionsToHTMLProto()
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  populateButtonsFromConfig() {
    let buttons = atom.config.get(`${PACK}.buttons`) || {}

    setupScripts('clear')

    items = Object
      .keys(buttons)
      .map(tooltip => {

        let btn = buttons[tooltip]
        if (!btn || !btn.cmd)
          return

        let callback = composeCallback(btn.cmd, { ...btn, tooltip })
        let item = { ...btn, tooltip, callback }
        return this.addButton(item)
      })
      .sort((a, b) =>
        a.index > b.index ? 1 :
        a.index < b.index ? -1 : 0)
  },

  removeInvalidButtons () {
    for (let index in items) {
      if (!items[index] || !items[index].callback)
        items.splice(index, 1)
    }
  },

  addButton (btn) {
    let button = { ...defaults, ...btn }
    items.push(button)
    this.removeInvalidButtons()
    return button
  },

  removeButton (tooltip) {
    let { toolBarView } = toolbar

    items = items.filter(btn =>btn.tooltip !== tooltip)
    toolBarView.removeItem(toolBarView.items.find(
      btn => btn.options.tooltip === tooltip))
  },

  saveState () {
    if (!items.length)
      return
    let buttons = this.serialize()
    atom.config.set(`${PACK}.buttons`, buttons)
    this.redrawButtons()
  },

  serialize() {
    return items
      .reduce((tot, c, index) => !c ? tot  : {
        ...tot,
        [c.tooltip]: {
          index,
          icon: c.icon,
          iconset: c.iconset,
          cmd: c.cmd,
          data: c.data,
        }
      }, {} )
  },

  clear() {
    return toolbar ? toolbar.removeItems() : null
  },

  redrawButtons() {
    this.clear()
    for (let n in items) {
      let button = items[n]
      if (!button)
        continue
      toolbar.addButton({ ...defaults, ...button })
    }
    this.insertDevButtons()
  },

  toggleView (view, state=null) {
    view = views[view]
    state = (state === null) ? view.isVisible() : state

    let method = state === false ? 'show' : 'hide'
    Object.keys(views).forEach(vi =>
      views[vi] == view ?
      views[vi][method]() :
      views[vi].hide())
  },

  insertDevButtons () {
    if (!toolbar)
      return

    let spacer = toolbar.addSpacer({
      priority: 2,
      tooltip: 'dev-separator',
      className: 'devsep'
    })

    // Add button button
    let addItemBtn = toolbar.addButton({
      tooltip: 'Add button',
      icon: 'plus',
      priority: 2,
      callback: () => this.toggleView('edit'),
    })

    // Remove button button
    let removeItemBtn = toolbar.addButton({
      tooltip: 'Remove button',
      icon: 'x',
      priority: 2,
      callback: () => this.toggleView('remove')
    })

    spacer.element.classList.add('separator')
    addItemBtn.element.classList.add('btn-config', 'add-item')
    removeItemBtn.element.classList.add('btn-config', 'remove-item')
  },

  consumeToolBar(getToolbar) {
    toolbar = getToolbar(toolbarName)
    this.populateButtonsFromConfig.call(this)
    this.redrawButtons.call(this)
    views = {
      edit:   view(EditView,   { main: this, toolbar, create: bn => {
        this.addButton(bn)
        this.saveState()
      }}),
      remove: view(RemoveView, {
        main: this,
        items,
        toolbar,
        update: (...itemset) => {
          items = itemset
          this.saveState()
        },
        delete: id => {
          this.removeButton(id)
          this.saveState()
        },
      }),
    }

    toolbar.onDidDestroy(() => {
      toolbar = null
      for (let view of views)
        view.destroy()
    })

  }
}
