'use babel'

import React from 'react'
import { CompositeDisposable } from 'atom'
import ListItem from '../components/ListItemComponent'
import DisposableEvent from '../util/DisposableEvent'
import prop from 'prop-types'

function getElementIndex (el) {
  let group = [...el.parentElement.children]
  let index = group.findIndex(o => o == el)
  return index
}

const ListComponent = ({ items, updateItem }) => {

  let index, beginIndex
  let draggedItem
  let boundParent
  let subscriptions

  const dragStart = e => {
    draggedItem   = e.nativeEvent.path.find(o => o.tagName === 'LI')
    boundParent   = draggedItem.parentElement
    beginIndex    = getElementIndex(draggedItem)
    subscriptions = new CompositeDisposable()
    subscriptions.add(
      new DisposableEvent(document, 'mouseup', e => dragEnd(e)),
      new DisposableEvent(document, 'mousemove', e => dragMove(e)),
    )
    e.preventDefault()
  }

  const dragEnd = e => {
    e.preventDefault()
    updateItem(beginIndex, index)
    subscriptions.dispose()
    draggedItem = null
  }

  const dragMove = e => {
    let el = e.path.find(o=>o.tagName==='LI')

    if (!el || el.parentElement !== boundParent)
      return

    index = getElementIndex(el) + 1
    el.insertAdjacentElement('beforeBegin', draggedItem)
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

ListComponent.propTypes = {
  items: prop.array.isRequired,
  updateItem: prop.func.isRequired,
}

export default ListComponent
