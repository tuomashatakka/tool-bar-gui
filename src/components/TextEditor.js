'use babel'


import prop from 'prop-types'
import React, { Component } from 'react'

import { Emitter } from 'atom'


function getGrammar (ext) {
  let grammarExtension = ext || '.js'
  let grammar = atom.grammars.getGrammars().find(o => o.scopeName.search(grammarExtension) > 0)
  return grammar
}


export default class TextEditor extends Component {

  static propTypes = {
    name:         prop.string.isRequired,
    grammar:      prop.string,
    initialValue: prop.string,
  }

  constructor (props) {
    super(props)
    this.grammar = getGrammar(this.props.grammar)
    this.emitter  = new Emitter()
  }

  set name (name) {
    this.editor.element.setAttribute('name', name)
  }

  get name () {
    return this.editor.element.getAttribute('name')
  }

  get value () {
    this.editor.getText()
  }

  set value (text) {
    this.editor.setText(text)
  }

  render () {

    const applyEditor = ref => {
      if (!ref || this.editor)
        return
      this.editor = ref.getModel()
      this.editor.setGrammar(this.grammar)
      this.editor.onDidStopChanging(() => this.emitter.emit('change', { text: this.value }))
    }

    return <atom-text-editor
      mini
      ref={applyEditor}
      name={this.props.name}>
      {this.props.initialValue}
    </atom-text-editor>
  }


  // SECTION: Event subscriptions

  /**
   * Register a handler for editor's change event
   * @method onChange
   * @param  {Function} callback The event listener callback handler function
   */

  onChange (callback) {
    this.emitter.on('change', callback)
  }
}
