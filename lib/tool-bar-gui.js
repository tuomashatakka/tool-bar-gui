'use babel';

import { CompositeDisposable } from 'atom'
import applyFormFunctionsToHTMLProto from './forms'
import view, { EditView, RemoveView } from './views'
import { composeCallback, setupScripts } from './dispatch'


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

    applyFormFunctionsToHTMLProto()
    this.subscriptions = new CompositeDisposable()

    // Register a command for toggling
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tool-bar-gui:toggle': () => this.insertDevButtons(),
    }))
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  populateButtonsFromConfig() {
    let buttons = atom.config.get(`${PACK}.buttons`) || {}

    setupScripts()

    items = Object
      .keys(buttons)
      .map(tooltip => {

        let btn = buttons[tooltip]
        if (!btn || !btn.cmd)
          return

        let callback = composeCallback(btn.cmd, { ...btn, tooltip })
        let item = { ...btn, tooltip, callback }

        this.addButton(item)
        return item
      })
      .sort((a, b) =>
        a.index > b.index ? 1 :
        a.index < b.index ? -1 : 0)

    console.info("populated from config:", items)
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
  },

  updateButton (n, btn) {
    let button = { ...defaults, ...btn }
    items.splice(n, 1, button)
    this.removeInvalidButtons()
  },

  removeButton (tooltip) {
    let { toolBarView } = toolbar

    items =
      items
      .filter(btn =>
        btn.tooltip !== tooltip)

    toolBarView.removeItem(
      toolBarView.items.find(
        btn => btn.options.tooltip === tooltip))
  },

  saveState () {
    if (!items.length)
      return
    let buttons = this.serialize()
    console.info(items, buttons)
    atom.config.set(`${PACK}.buttons`, buttons)
    this.redrawButtons()
  },

  serialize() {
    return items
      .reduce((tot, c, index) => !c ? tot  : {
        ...tot, [c.tooltip]: {
          index,
          icon: c.icon,
          iconset: c.iconset,
          cmd: c.cmd,
          data: c.data,
        } }, {} )
  },

  clear() {
    return toolbar ? toolbar.removeItems() : null
  },

  redrawButtons() {
    this.clear()
    if (!toolbar)
      return
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
    console.info({view, state, method}, views)
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
          console.log(itemset)
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

  // Callback with modifiers
    // toolbar.addButton({
    //   icon: 'octoface',
    //   callback: {
    //     '': 'application:cmd-1',      // Without modifiers is default action
    //     'alt': 'application:cmd-2',
    //     'ctrl': 'application:cmd-3',  // With function callback
    //     'shift'(data) {
    //       console.log(data);
    //     },
    //     'alt+shift': 'application:cmd-5',       // Multiple modifiers
    //     'alt+ctrl+shift': 'application:cmd-6'   // All modifiers
    //   },
    //   data: 'foo'
    // });
  }
}
