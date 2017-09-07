'use babel'

import React from 'react'
import { render } from 'react-dom'

import PaneItemElement from './PaneItemElement'

import RemoveView from './RemoveView'
export RemoveView from './RemoveView'

import EditView from './EditView'
export EditView from './EditView'

let viewOpener

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

function getElementForComponent (ViewClass, props) {

  let el = new PaneItemElement(ViewClass.title)
  let component = <ViewClass {...props} />
  let renderedComponent = render(component, el.getItem())
  let { className } = renderedComponent

  el.getItem().classList.add(className)
  console.log(el) // FIXME: Remove

  return el
}

function getViewOpener () {

  const getPropsFromUri = uri =>  {
    let parts = uri.split('/')
    let args  = parts[parts.length - 1].split(/(;|&)\s*/g)
    return args.reduce((ret, itr) => {
      let [ key, val ] = itr.split(/=\s*/g)
      return { ...ret, [key]: val }
    }, {})
  }

  return viewOpener || (
    viewOpener = atom.workspace.addOpener(uri => {
      if (uri.startsWith('atom://tool-bar')) {
        let args = getPropsFromUri(uri)
        if (uri.search('tool-bar/edit'))
          return getElementForComponent(EditView, args)
        if (uri.search('tool-bar/remove'))
          return createView(RemoveView, args)
      }
    })
  )
}

export function open (type, args={}) {

  if (!viewOpener)
    viewOpener = getViewOpener()

  args = Object
    .keys(args)
    .map(key => `${key}=${args[key]}`)
    .join('/')

  let uri = ['atom://tool-bar', type, args].join('/')

  console.info(type, args, "=>", uri)
  return atom.workspace.open(uri)
}
