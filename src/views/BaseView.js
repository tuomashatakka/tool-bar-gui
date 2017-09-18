'use babel'
import React, { Component } from 'react'
import prop from 'prop-types'
import { Emitter } from 'atom'

export default class BasePanelView extends Component {

  static propTypes = {
    host: prop.element.isRequired,
  }

  className = 'tool-bar-button-edit-view'
  toolbar   = null
  title     = ''
  subtitle  = ''
  props     = {}
  onSubmit  = () => {}
  // onCancel  = () => {}

  constructor () {
    super(...arguments)

    this.__render = this.render
    this.emitter  = new Emitter()
    this.render   = () =>
      <form onSubmit={this.submit.bind(this)}>
        {this.header}
        {this.__render()}
        {this.footer}
      </form>

    this.emitter.on('form-error', (error) => this.updateState({ error }))
    this.initialize()
  }

  initialize () {
    
  }

  isValid () {
    return false
  }

  submit = (e) => {
    let data = this.getSubmitData()
    let validation = this.isValid(data)
    if (validation === true)
      this.dispatch(e, 'submit', data)
    else
      this.emitter.emit('form-error', validation)
    e.preventDefault()
  }

  cancel = (e) =>
    this.dispatch(e, 'cancel')

  dispatch (origin, name, detail) {
    let event = new CustomEvent(name, { detail })
    this.element.dispatchEvent(event)

    if (!origin.isDefaultPrevented())
      origin.preventDefault()
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

  destroy () {
    if (this.panel)
      this.panel.destroy()
    this.emitter.destroy()
  }

}
