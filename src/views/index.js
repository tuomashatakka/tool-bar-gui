'use babel'

import React from 'react'
import { render } from 'react-dom'
export RemoveView from './RemoveView'
export EditView from './EditView'

export function createDockItem () {
  atom.workspace.open()
}

export default function createView (ViewClass, props) {

  let item = document.createElement('i')
  let panel = atom.workspace.addRightPanel({ item })
  let el = atom.views.getView(panel)
  let component = <ViewClass {...props} />
  let renderedComponent = render(component, el)
  let { className } = renderedComponent

  renderedComponent.panel = panel
  renderedComponent.hide()
  el.classList.add(className)

  return renderedComponent
}
