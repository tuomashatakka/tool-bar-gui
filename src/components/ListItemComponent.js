'use babel'

import React from 'react'
import prop from 'prop-types'

const ListItem = item => {

  let onMouseDown = item.onMouseDown
  let onClick     = item.action ? () => item.action(item) : null

  return <li
    className='list-item'
    onMouseDown={onMouseDown}
    onClick={onClick}>

    <span className={`icon ${item.iconset || ''} ${item.iconset || 'icon'}-${item.icon}`} />
    <span className='title'>{item.text}</span>

  </li>
}

ListItem.propTypes = {
  icon:         prop.string,
  text:         prop.string,
  iconset:      prop.string.isRequired,

  action:       prop.func,
  onMouseDown:  prop.func,
}

export default ListItem
