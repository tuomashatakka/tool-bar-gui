'use babel'

export async function activateOrOpenInNewPane (item) {
  let pane = atom.workspace.paneForItem(item)
  if (pane)
    return pane.activateItem(item)
  else
    return await splitRight(item)
}

async function splitRight (item) {
  let pane = atom.workspace.getActivePane()
  if (!pane)
    return await atom.workspace.open(item)
  return pane.splitRight().addItem(item)
}

export function toggleView (el) {
  let paneItem = atom.workspace.getPaneItems().find(item => {
    let view = atom.views.getView(item)
    let node = el
    while (node) {
      if (node == view) return true
      node = node.parentElement
    }

    return false
  })
  if (paneItem)
    return atom.workspace.toggle(paneItem)
}
