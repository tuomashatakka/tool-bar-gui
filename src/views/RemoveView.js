'use babel'

import self from 'autobind-decorator'
import React from 'react'
import BaseView from './BaseView'
import List from '../components/DraggableList'

export default class RemoveView extends BaseView {

  title = 'Remove items'
  subtitle = 'Remove items from the tool bar.'
  className = 'tool-bar-button-remove-view'

  constructor (props) {
    super(props)
  }

  get listItems () {
    let action     = item => this.props.fragment.removeItem(item)
    let withAction = item => ({...item, action})
    return this.props.fragment
      .items
      .toJSON()
      .map(withAction)
  }

  @self
  updateItemPosition (from, to) {
    this.props.fragment.moveItem(from, to)
  }

  render () {
    return (
      <div className='panel-body padded '>

        <section className='instructions text-subtle'>
          <p>Drag to reorder, click to delete.</p>
        </section>

        <List
          items={this.listItems}
          updateItem={this.updateItemPosition}
        />

      </div>
    )
  }

}
