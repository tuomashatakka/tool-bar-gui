'use babel'

import prop from 'prop-types'
import React, { Component } from 'react'
import self from 'autobind-decorator'
import List from '../components/DraggableList'
import ToolbarFragment from '../models/ToolbarFragment'
import { toggleView } from '../util'

let addedSubscription

export default class ManageView extends Component {

  title = 'Manage items'
  subtitle = 'Edit the tool bar\'s items.'

  static propTypes = {
    fragment: prop.instanceOf(ToolbarFragment)
  }

  get items () {
    if (!addedSubscription)
      addedSubscription = this.props.fragment.onDidAddItem(() => this.forceUpdate())
    return this.props.fragment.items.toArray()
  }

  @self
  openItem (item) {
    atom.workspace.open(item)
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
        Delete: () => this.removeItem(item),
        Cancel: () => {}
      }
    })
  }

  removeItem (item) {
    this.props.fragment.removeItem(item)
    this.forceUpdate()
    atom.notifications.addSuccess(item.toString() + ' removed from the tool-bar')
  }

  render () {
    let host
    return (
      <div className='tool-panel'
        ref={ref => ref && (host = ref.parentElement)}>
        <header className='panel-heading padded'>
          <h3>{this.title}</h3>
          <p>{this.subtitle}</p>
        </header>
        <div className='panel-body'>

          <section className='align-center instructions text-subtle padded'>
            <p>Drag to reorder, click to modify.</p>
          </section>

          <List
            items={this.items}
            onClick={this.openItem}
            onMoveItem={this.updateItemPosition}
            onRemoveItem={this.promptRemoveItem}
          />

        </div>
        <footer className='panel-footer padded'>
          <button
            className='btn btn-error'
            onClick={() => toggleView(host)}>
              Close</button>
        </footer>
      </div>
    )
  }

}
