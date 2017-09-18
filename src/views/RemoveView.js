'use babel'

import self from 'autobind-decorator'
import React from 'react'
import BaseView from './BaseView'
import List from '../components/DraggableList'

let addedSubscription

export default class RemoveView extends BaseView {

  title = 'Remove items'
  subtitle = 'Remove items from the tool bar.'
  className = 'tool-bar-button-remove-view'

  get items () {
    if (!addedSubscription)
      addedSubscription = this.props.fragment.onDidAddItem(() => this.forceUpdate())
    return this.props.fragment.items.toArray()
  }

  removeItem (item) {
    this.props.fragment.removeItem(item)
    this.forceUpdate()
  }

  @self
  updateItemPosition (item, to) {
    this.props.fragment.moveItem(item, to)
  }

  @self
  promptRemoveItem (item) {
    atom.confirm({
      message: 'Remove an item from the toolbar?',
      detailedMessage: 'Are you sure you want to delete the item ' + item.toString() + ' from your tool-bar?',
      buttons: {
        Yes: () => this.removeItem(item),
        No: () => {}
      }
    })
  }

  render () {
    return (
      <div className='panel-body padded '>

        <section className='instructions text-subtle'>
          <p>Drag to reorder, click to delete.</p>
        </section>

        <List
          items={this.items}
          onClick={this.promptRemoveItem}
          onMoveItem={this.updateItemPosition}
        />

      </div>
    )
  }

}
