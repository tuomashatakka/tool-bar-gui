'use babel'

import { clearScripts } from './filesystem'
import { CompositeDisposable } from 'atom'
import { activateOrOpenInNewPane } from './util'
import initializeComponentElement from './util/ComponentElement'
import EditView from './views/EditView'
import ManageView from './views/ManageView'
import RemoveView from './views/RemoveView'
import ToolbarAction from './models/ToolbarAction'
import ToolbarFragment from './models/ToolbarFragment'

let subscriptions

const toolbarDefaultName  = 'undefined' // 'general'
const createEditView = initializeComponentElement('toolbar-edit-view', EditView)
const createManageView = initializeComponentElement('toolbar-manage-view', ManageView)
const createRemoveView = initializeComponentElement('toolbar-remove-view', RemoveView)


export function activate () {

  subscriptions = new CompositeDisposable()
  const commandsDisposable = atom.commands.add('atom-workspace', {
    'tool-bar-gui:purge-script-files': () => clearScripts()
  })
  const editViewDisposable = atom.views.addViewProvider(ToolbarAction, action => createEditView({ action }))
  const manageViewDisposable = atom.views.addViewProvider(ToolbarFragment, fragment => createManageView({ fragment }))

  subscriptions.add(
    commandsDisposable,
    editViewDisposable,
    manageViewDisposable,
  )
}


export function deactivate () {
  subscriptions.dispose()
}


export function consumeToolBar(getToolbar) {

  let managementToolbar = getToolbar('management')

  let meta              = { name: toolbarDefaultName }
  let toolbar           = getToolbar(toolbarDefaultName)
  let fragment          = new ToolbarFragment(toolbar, meta)
  // let managementFragment = new ToolbarFragment(managementToolbar)

  addManagementButtons(managementToolbar, fragment)
}


function addManagementButtons (managementToolbar, fragment) {

  managementToolbar.removeItems()

  // Empty gutter to force the manage buttons to the
  // right without floating them
  let spacer = managementToolbar.addSpacer({
    priority:   80,
    tooltip:    'dev-separator',
    className:  'separator devsep'
  })
  spacer.element.classList.add('separator')

  // Add button
  let addBtn = managementToolbar.addButton({
    priority:   83,
    icon:       'plus',
    tooltip:    'Add item to toolbar',
    callback:   () =>
      ToolbarAction
      .initialize()
      .then(fragment.addItem.bind(fragment)),
  })
  addBtn.element.classList.add('btn-config', 'edit')

  // Remove button
  let removeBtn = managementToolbar.addButton({
    priority:   84,
    icon:       'x',
    tooltip:    'Remove items from toolbar',
    callback:   () => atom.workspace.open({
      item: document.createElement('toolbar-remove-view'),
      getTitle () { return 'Remove tool-bar items' }
    })
  })
  removeBtn.element.classList.add('btn-config', 'remove')

  // Menu button
  let editBtn = managementToolbar.addButton({
    priority:   85,
    icon:       'grabber',
    tooltip:    'Edit toolbar items',
    callback:   () => activateOrOpenInNewPane(fragment)
  })
  editBtn.element.classList.add('btn-config', 'manage')

}
