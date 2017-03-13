'use babel';

import { CompositeDisposable } from 'atom'
import EditView from './EditButtonView'
import RemoveView from './RemoveButtonView'
import { composeCallback, setupScripts } from './dispatch'


const PACK = 'tool-bar-autonomy'
const defaults = {
  priority: 1,
  tooltip: '',
  icon: '',
  iconset: 'ion',
  callback: function () { console.warn(arguments) },
}

window.p = PACK

export default {

  subscriptions: null,
  views: {},
  toolbar: null,
  state: {
    buttons: [],
  },

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()
    this.views.edit = new EditView()
    this.views.remove = new RemoveView()

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tool-bar-autonomy:toggle': () => this.insertDevButtons(),
    }))
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  populateButtonsFromConfig() {

    if (this.state.buttons.filter(btn => btn && btn.cmd ? true : false).length)
      return
    let buttons = atom.config.get(`${PACK}.buttons`) || {}

    setupScripts()

    Object.keys(buttons).forEach(tooltip => {
      let btn = buttons[tooltip]
      let callback = composeCallback(btn.cmd, { ...btn, tooltip })
      this.addButton({ ...btn, tooltip, callback })
    })
  },

  removeInvalidButtons () {
    for (let index in this.state.buttons) {
      if (!this.state.buttons[index] || !this.state.buttons[index].callback)
        this.state.buttons.splice(index, 1)
    }
  },

  addButton (btn) {
    this.state.buttons.push({
      ...defaults, ...btn })
    this.removeInvalidButtons()
  },

  removeButton (tooltip) {
    let { toolBarView } = this.toolbar

    this.state.buttons =
      this.state.buttons
      .filter(btn =>
        btn.tooltip !== tooltip)

    toolBarView.removeItem(
      toolBarView.items.find(
        btn => btn.options.tooltip === tooltip))

    this.views.remove.buttons = this.state.buttons
  },

  saveState () {
    let buttons = {}
    for (let button of this.state.buttons) {
      if (!button)
        continue
      let { tooltip, icon, iconset, cmd, data } = button
      buttons[tooltip] = { icon, iconset, cmd, data }
    }
    atom.config.set(`${PACK}.buttons`, buttons)
    this.redrawButtons()
  },

  serialize() {
    this.state.buttons
      .reduce((tot, c) => !c ? tot  : {
        ...tot, [c.tooltip]: {
          icon: c.icon,
          iconset: c.iconset,
          cmd: c.cmd,
          data: c.data,
        } }, {} )
  },

  clear() {
    return this.toolbar ? this.toolbar.removeItems() : null
  },

  redrawButtons() {
    this.populateButtonsFromConfig.call(this)
    if (!this.toolbar)
      return

    this.clear()
    let { buttons } = this.state
    for (let n in buttons) {
      let button = buttons[n]
      if (!button)
        continue
      this.toolbar.addButton({ ...defaults, ...button })
    }

    if (atom.devMode)
      this.insertDevButtons()

  },

  toggleEditPanel (show=null) {
    let method = 'show'
    if (show === null)
      method = this.views.edit.isVisible() ? 'hide' : 'show'
    else
      method = show ? 'show' : 'hide'
    this.views.edit[method]()
  },

  toggleRemovePanel (show=null) {

    this.views.remove.buttons = this.state.buttons
    let method = 'show'
    if (show === null)
      method = this.views.remove.isVisible() ? 'hide' : 'show'
    else
      method = show ? 'show' : 'hide'
    this.views.remove[method]()
  },

  insertDevButtons () {
    if (!this.toolbar)
      return

    this.toolbar.addSpacer({
      priority: 2,
    })

    // Add button button
    this.toolbar.addButton({
      tooltip: 'Add button',
      icon: 'plus',
      priority: 2,
      callback: () => {

        this.toggleEditPanel()

        this.views.edit.onCancel = () =>
          this.toggleEditPanel(false)

        this.views.edit.onSubmit = data => {
          this.toggleEditPanel(false)
          let cmd = data.callback
          let callback = composeCallback(cmd, data)
          this.addButton({ ...data, callback, cmd })
          this.saveState()
        }
      },
    })

    // Remove button button
    this.toolbar.addButton({
      tooltip: 'Remove button',
      icon: 'x',
      priority: 2,
      callback: () => {

        this.toggleRemovePanel()

        this.views.remove.onCancel = () =>
          this.toggleRemovePanel(false)

        this.views.remove.onSubmit = data => {
          this.toggleRemovePanel(true)
          this.removeButton(data)
          this.saveState()
        }
      },
    })
  },

  consumeToolBar(Toolbar) {
    this.toolbar = Toolbar('tool-bar-autonomy')
    this.toolbar.onDidDestroy(() => {
      this.toolbar = null
    })
    this.redrawButtons.call(this)
  // Callback with modifiers
    // this.toolbar.addButton({
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
