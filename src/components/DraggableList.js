'use babel'

import React from 'react'
import { CompositeDisposable, Disposable } from 'atom'
import ListItem from '../components/ListItemComponent'
import DisposableEvent from '../util/DisposableEvent'
import prop from 'prop-types'

const { abs, min, max, sqrt } = Math
const SNAP_CLICK_DISTANCE = 4

let index
let beginIndex
let draggedItem
let draggedElement
let boundParent
let subscriptions = new CompositeDisposable()
let handleClick = () => {}
let handleMove = () => {}

let x = 0, y = 0, allowMove = false


function getElementIndex (el, bounds) {
  if (!el)
    return bounds ? bounds[1] : 0
  if (!bounds)
    bounds = [ 0, el.parentElement.childElementCount ]
  let group = [...el.parentElement.children]
  let index = group.findIndex(o => o == el)
  if (index === -1)
    index = bounds[1]
  return max(bounds[0], min(index, bounds[1]))
}


function onDragStart (item, event) {
  draggedElement = event.nativeEvent.path.find(o => o.tagName === 'LI')

  if (!draggedElement)
    return subscriptions.dispose()

  allowMove     = false
  draggedItem   = item
  boundParent   = draggedElement.parentElement

  if (!boundParent)
    return

  beginIndex    = getElementIndex(draggedElement)
  subscriptions = new CompositeDisposable()
  subscriptions.add(
    new Disposable(() => document.body.classList.remove('disable-selection')),
    new DisposableEvent(document, 'mouseup', onDragEnd),
    new DisposableEvent(document, 'mousemove', onDragMove),
  )
  document.body.classList.add('disable-selection')
  event.preventDefault()
}


function onDragEnd (event) {
  event.preventDefault()
  subscriptions.dispose()
  if (allowMove)
    handleMove(draggedItem, index, beginIndex)
  else
    handleClick(draggedItem)
  allowMove      = false
  draggedElement = null
}

function distance (x0, y0, x1, y1) {
  let x = abs(x1 - x0)
  let y = abs(y1 - y0)
  return sqrt(x * x + y * y)
}


function onDragMove (event) {
  if (!draggedElement)
    return
  let el = event.path.find(o => o.tagName==='LI')
  if (el && el.parentElement !== boundParent)
    return

  if (!allowMove) {
    let { clientX: x1, clientY: y1 } = event
    if (distance(x, y, x1, y1) > SNAP_CLICK_DISTANCE)
      allowMove = true
  }
  if (allowMove) {
    index = getElementIndex(el, [ 0, boundParent.childElementCount ])
    try {
      boundParent.insertBefore(draggedElement, el)
    }
    catch (e) {
      boundParent.appendChild(draggedElement)
    }
  }
  event.preventDefault()
}


const ListComponent = ({ items, onMoveItem, onClick }) => {
  handleMove = onMoveItem
  handleClick = onClick

  return <ul
    className='select-list list-group'>
    {list(items, onDragStart)}
  </ul>
}


export const list = (items, onMouseDown) => items.map(item =>
  <ListItem
    key={item.tooltip}
    text={item.tooltip}
    action={item.action}
    iconset={item.iconset}
    icon={item.icon}
    onMouseDown={onMouseDown.bind(null, item)}
  />)


ListComponent.propTypes = {
  items: prop.array.isRequired,
  onMoveItem: prop.func.isRequired,
  onClick: prop.func.isRequired,
}


export default ListComponent
