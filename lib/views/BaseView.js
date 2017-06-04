'use babel'
import React, { Component } from 'react'
import { render } from 'react-dom'

export default class BasePanelView extends Component {

  className = 'tool-bar-button-edit-view'
  toolbar   = null
  title     = ''
  subtitle  = ''
  props     = {}
  onSubmit  = () => {}
  // onCancel  = () => {}

  constructor(p) {
    super(p)
    this.main = p.main
    this.__render = this.render

    this.render = () => <form onSubmit={({ target }) => this.submit(target.getFormData())}>
      {this.header}
      {this.__render()}
      {this.footer}
    </form>
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

  get element () {
    return atom.views.getView(this.panel)
  }

  getItem () {
    return this.element
  }

  get item () {
    return this.element
  }

  show () { this.item.classList.remove('hidden') }
  hide () { this.item.classList.add('hidden') }
  toggle () { return (this.isVisible()) ? this.hide() : this.show() }
  isVisible () { return !this.item.classList.contains('hidden') }
  destroy () {
    this.panel.destroy()
  }

}
