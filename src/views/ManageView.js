'use babel'

import prop from 'prop-types'
import React, { Component } from 'react'
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

  render () {
    let host
    return (
      <div className='tool-panel'
        ref={ref => ref && (host = ref.parentElement)}>
        <header className='panel-heading padded'>
          <h3>{this.title}</h3>
          <p>{this.subtitle}</p>
        </header>
        <div className='panel-body padded '>

          <section className='instructions text-subtle'>
            <p>Drag to reorder, click to modify.</p>
          </section>

          <List
            items={this.items}
            onClick={(item) => atom.workspace.open(item)}
            onMoveItem={(item, to) => this.props.fragment.moveItem(item, to)}
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
