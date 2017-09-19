'use babel'

import React from 'react'
import prop from 'prop-types'

const ListItem = item => {

  let remove      = item.remove || (()=>{})
  let onClick     = item.action ? () => item.action(item) : null
  let onMouseDown = item.onMouseDown

  return <li
    className='list-item'
    onMouseDown={onMouseDown}
    onClick={onClick}>

    <span className={`icon ${item.iconset || ''} ${item.iconset || 'icon'}-${item.icon}`} />
    <span className='title'>{item.text}</span>

    { remove ?
    <div className='btn-group btn-group-xs'>
      <button
        className='btn btn-error icon icon-x'
        onClick={remove}></button>
    </div>
    : null }

  </li>
}

ListItem.propTypes = {
  icon:         prop.string,
  text:         prop.string,
  iconset:      prop.string,

  action:       prop.func,
  removr:       prop.func,
  onMouseDown:  prop.func,
}

export default ListItem
