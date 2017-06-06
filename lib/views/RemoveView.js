'use babel'

import React from 'react'
import BaseView from './BaseView'
import List from '../components/DraggableList'

export default class RemoveView extends BaseView {

  title = 'Remove items'
  subtitle = 'Remove items from the tool bar.'
  className = 'tool-bar-button-remove-view'

  constructor (props) {
    super(props)
    this.state = { items: props.items }
  }

  show () {
    this.item.classList.remove('hidden')
  }

  render () {
    let action = item => this.props.delete(item.text)
    let items  = this.state.items.map(item => ({...item, action}))

    let updateItemPosition = (from, to) => {
      to = (to > from) ? to - 1 : to

      let item = items.splice(from, 1)
      items.splice(to, 0, item[0])
      this.setState({ items })
      this.props.update(...items)
    }

    return <div className='panel-body padded '>
      <List
        items={items}
        updateItem={updateItemPosition}
      />
    </div>
  }

}
