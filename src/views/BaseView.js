'use babel'
import React, { Component } from 'react'
import prop from 'prop-types'
import { Emitter } from 'atom'

export default class BasePanelView extends Component {

  static propTypes = {
    host: prop.node.isRequired,
  }

  className = 'tool-bar-button-edit-view'
  toolbar   = null
  title     = ''
  subtitle  = ''
  props     = {}
  onSubmit  = () => {}
  // onCancel  = () => {}

  constructor(p) {
    super(p)
    this.emitter  = new Emitter()
    this.__render = this.render
    this.render   = () =>
      <form onSubmit={this.submit.bind(this)}>
        {this.header}
        {this.__render()}
        {this.footer}
      </form>
  }

  submit = (e) => this.dispatch(e, 'submit', this.getSubmitData())
  cancel = (e) => this.dispatch(e, 'cancel')

  dispatch (origin, name, detail) {
    let event = new CustomEvent(name, { detail })
    this.element.dispatchEvent(event)

    origin.preventDefault()
    return false
  }

  getSubmitData () {
    return {}
  }

  get header () {
    return <header className='panel-heading padded'>
        <h3>{this.title}</h3>
        <p>{this.subtitle}</p>
      </header>
  }

  get footer () {
    return null
  }

  getItem () {
    return this.element
  }

  get element () {
    return this.props.host
  }

  show () {
    this.item.classList.remove('hidden')
  }

  hide () {
    atom.workspace.hide(this.element)
  }

  toggle () {
    return (this.isVisible()) ? this.hide() : this.show()
  }

  isVisible () {
    return !this.item.classList.contains('hidden')
  }

  destroy () {
    if (this.panel)
      this.panel.destroy()
    this.emitter.destroy()
  }

}
