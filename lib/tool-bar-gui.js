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

let toolbar, views, toolbarName = PACK

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

    Object.keys(buttons).forEach(tooltip => {

      let btn = buttons[tooltip]
      if (!btn || !btn.cmd)
        return
      let callback = composeCallback(btn.cmd, { ...btn, tooltip })
      this.addButton({ ...btn, tooltip, callback })
    })
  },

  removeInvalidButtons () {
    for (let index in this.buttons) {
      if (!this.buttons[index] || !this.buttons[index].callback)
        this.buttons.splice(index, 1)
    }
  },

  addButton (btn) {
    let button = { ...defaults, ...btn }
    this.buttons.push(button)
    this.removeInvalidButtons()
  },

  removeButton (tooltip) {
    let { toolBarView } = toolbar

    this.buttons =
      this.buttons
      .filter(btn =>
        btn.tooltip !== tooltip)

    toolBarView.removeItem(
      toolBarView.items.find(
        btn => btn.options.tooltip === tooltip))

    views.remove.buttons = this.buttons
  },

  saveState () {
    let buttons = {}
    for (let button of this.buttons) {
      if (!button)
        continue
      let { tooltip, icon, iconset, cmd, data } = button
      buttons[tooltip] = { icon, iconset, cmd, data }
    }
    atom.config.set(`${PACK}.buttons`, buttons)
    this.redrawButtons()
  },

  serialize() {
    this.buttons
      .reduce((tot, c) => !c ? tot  : {
        ...tot, [c.tooltip]: {
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
    this.populateButtonsFromConfig.call(this)
    if (!toolbar)
      return

    this.clear()
    let { buttons } = this
    for (let n in buttons) {
      let button = buttons[n]
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
      callback: () => {

        this.toggleView('edit')
        // views.edit.toggle()
        // views.edit.onSubmit = data => {
          //
          // let cmd = data.callback
          // let callback = composeCallback(cmd, data)
          //
          // this.toggleView('edit', false)
          // this.addButton({ ...data, callback, cmd })
          //
          // this.saveState()
        // }
      },
    })

    // Remove button button
    let removeItemBtn = toolbar.addButton({
      tooltip: 'Remove button',
      icon: 'x',
      priority: 2,
      callback: () => {

        this.toggleView('remove')

        views.remove.onSubmit = data => {
          this.removeButton(data)
          this.toggleView('remove', true)

          this.saveState()
        }
      },
    })

    spacer.element.classList.add('separator')
    addItemBtn.element.classList.add('btn-config', 'add-item')
    removeItemBtn.element.classList.add('btn-config', 'remove-item')
  },

  consumeToolBar(getToolbar) {

    toolbar = getToolbar(toolbarName)
    views = {
      edit:   view(EditView,   { main: this, toolbar, create: bn => {
        this.addButton(bn)
        this.saveState()
      }}),
      remove: view(RemoveView, { main: this, toolbar, delete: id => {
        this.removeButton(id)
        this.saveState() 
      }}),
    }

    toolbar.onDidDestroy(() => {
      toolbar = null
      for (let view of views)
        view.destroy()
    })

    this.redrawButtons.call(this)

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
