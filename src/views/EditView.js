/** @babel */

import React from 'react'
// import prop from 'prop-types'
import BaseView from './BaseView'
import List from '../components/List'
import { serializeFormData } from '../forms'

const MAX_ENTRIES_VISIBLE = 8

export const commands = Object
  .keys(atom.commands.registeredCommands)
  .sort((a, b) => a > b ? 1 : a < b ? -1 : 0)

const filterCommands = q => q ?
  commands.filter(cmd => new RegExp(q).test(cmd)) :
  commands

export default class ToolBarEditPanelView extends BaseView {

  title    = 'Add item'
  subtitle = 'Add a new item to the tool bar.'

  static propTypes = {
  }

  state = {
    text: ''
  }

  getSubmitData () {
    return serializeFormData.call(
      this.element.querySelector('form'),
      true
    )
  }

  isValid (data) {
    for (let [ key, value ] in data) {
      if (value.trim().length === 0)
        return {
          key,
          exception: new Error(`Invalid value for the '${key}' field; value must not be empty.`),
        }
    }
    return true
  }

  get editor () {
    if (this.__editor)
      return this.__editor

    let gram = atom.grammars.getGrammars().find(o => o.scopeName.search('.js') > 0)
    let editor = atom.textEditors.build({
      grammar: gram
    })
    // editor.element.addEventListener('focus', console.log)
    editor.element.setAttribute('name', 'command')
    editor.onDidStopChanging(() => this.updateState({ text: this.__editor.getText() }))
    return (this.__editor = editor)
  }

  updateState (props={}) {
    this.setState(props)
  }

  get items () {
    let { text } = this.state
    let icon     = 'terminal'
    let action   = ({ text }) => this.editor.setText(text)

    if (!text.match(/\n/g))
      return filterCommands(text)
      .map(tooltip => ({ icon, tooltip, action, }))
      .slice(0, MAX_ENTRIES_VISIBLE)
    return []
  }

  render () {

    let { items } = this
    let { error } = this.state
    const attachEditor = ref => ref ? ref.appendChild(this.editor.element) : null
    const showErrors   = (field) => error && error.key === field ? error.exception.message : ''

    return <div className='panel-body padded'>

      <label className='form-group'>
        <div className="h5">Tooltip</div>
        <atom-text-editor mini name='tooltip' />
        {showErrors('tooltip')}
      </label>

      <label className='form-group'>
        <div className="h5">Icon</div>
        <atom-text-editor mini name='icon' />
        {showErrors('icon')}
      </label>

      <label className='form-group'>
        <div className="h5">Iconset</div>
        <select className="input-select" name='iconset'>
          <option value=''>Glyphicons</option>
          <option value='tri'>Trinity</option>
          <option value='fa'>Font Awesome</option>
          <option value='ion'>Ionicons</option>
          <option value='mdi'>Material Icons</option>
        </select>
        {showErrors('iconset')}
      </label>

      <label className='form-group command-editor'>
        <div className="h5">Callback command/function</div>
        <article ref={attachEditor} />
        <article className='commands-list'>
          {<List items={items} />}
        </article>
        {showErrors('command')}
      </label>

    </div>

  }

  get footer () {

    const bindInfo = (target) => {
      const focus = () => target.classList.remove('hidden')
      const blur  = () => target.classList.add('hidden')
      if (!target)
        return
      this.editor.element.removeEventListener('focus', focus)
      this.editor.element.removeEventListener('blur', blur)
      this.editor.element.addEventListener('focus', focus)
      this.editor.element.addEventListener('blur', blur)
    }

    return <footer className='panel-footer padded'>

      <section className='instructions text-subtle hidden' ref={bindInfo}>

        <p>
          You may choose to write either any javascript function (with window.atom
          available in its scope), for example <code>alert(3000)</code>
        </p>

        <p>
          Alternatively, you may choose for the button to dispatch an atom command by
          writing the command with its namespace to the callback field. For example
          <code>git-plus:add-all-and-commit</code>
        </p>

      </section>

      <section className='btn-toolbar'>
        <div className='btn-group'>

          <button
            className='btn'
            type='submit'>
            Add
          </button>

          <button
            onClick={this.cancel.bind(this)}
            className='btn btn-error'
            type='cancel'>
            Cancel
          </button>

        </div>
      </section>

    </footer>
  }
}
