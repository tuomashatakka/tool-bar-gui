'use babel'

import React from 'react'

const ListItem = item =>
  <li
    className='list-item'
    onClick={() => item.action(item)}>

    <span className={`icon ${item.iconset || ''} ${item.iconset || 'icon'}-${item.icon}`} />
    <span className='title'>{item.text}</span>

  </li>

export default ListItem
