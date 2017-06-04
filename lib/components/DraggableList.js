'use babel'

import React from 'react'
import { CompositeDisposable } from 'atom'
import ListItem from '../components/ListItemComponent'
import DisposableEvent from '../util/DisposableEvent'

function getElementIndex (el) {
  let group = [...el.parentElement.children]
  let index = group.findIndex(o => o == el)
  return index
}

const ListComponent = ({ items, updateItem }) => {

  let index, beginIndex
  let draggedItem
  let subscriptions

  const dragStart = e => {
    draggedItem   = e.nativeEvent.path.find(o => o.tagName === 'LI')
    beginIndex    = getElementIndex(draggedItem)
    subscriptions = new CompositeDisposable()
    subscriptions.add(
      new DisposableEvent('mouseup', dragEnd),
      new DisposableEvent('mousemove', drag),
    )
    e.preventDefault()
  }

  const dragEnd = e => {
    e.preventDefault()
    updateItem(beginIndex, index)
    subscriptions.dispose()
    draggedItem = null
  }

  const drag = e => {
    let el = e.path.find(o=>o.tagName==='LI')

    if (!el)
      return

    index = getElementIndex(el) + 1
    el.insertAdjacentElement('afterEnd', draggedItem)
    e.preventDefault()
  }

  return <ul
    className='select-list list-group'
    onMouseDown={dragStart}>
    {list(items)}
  </ul>
}

export const list = items => items.map(item =>
  <ListItem
    key={item.tooltip}
    text={item.tooltip}
    action={item.action.bind(item)}
    iconset={item.iconset}
    icon={item.icon}
  />)

export default ListComponent
