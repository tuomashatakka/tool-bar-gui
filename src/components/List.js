'use babel'

import React from 'react'
import ListItem from '../components/ListItemComponent'
import prop from 'prop-types'

const ListComponent = ({ items }) =>
  <ul className='select-list list-group'>
    {list(items)}
  </ul>

export const list = items => items.map((item, n) =>
  <ListItem
    key={n}
    text={item.name}
    action={item.action.bind(item)}
    iconset={item.iconset}
    icon={item.icon}
  />)

ListComponent.propTypes = {
  items: prop.array.isRequired,
}

export default ListComponent
