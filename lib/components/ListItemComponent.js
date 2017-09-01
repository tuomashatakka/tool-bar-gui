'use babel'

import React from 'react'
import prop from 'prop-types'

const ListItem = item =>
  <li
    className='list-item'
    onClick={() => item.action(item)}>

    <span className={`icon ${item.iconset || ''} ${item.iconset || 'icon'}-${item.icon}`} />
    <span className='title'>{item.text}</span>

  </li>

ListItem.propTypes = {
  icon:    prop.string,
  text:    prop.string,
  iconset: prop.string.isRequired,
}

export default ListItem
