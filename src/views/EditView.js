/** @babel */

import React, { Component } from 'react'
import prop from 'prop-types'
import List from '../components/List'
import { serializeFormData } from '../forms'
import Editor from '../components/TextEditor'
import { toggleView } from '../util'
import ToolbarAction from '../models/ToolbarAction'
import { Emitter } from 'atom'

const MAX_ENTRIES_VISIBLE = 8

export const commands = Object
  .keys(atom.commands.registeredCommands)
  .sort((a, b) => a > b ? 1 : a < b ? -1 : 0)

const filterCommands = q => q ?
  commands.filter(cmd => new RegExp(q).test(cmd)) :
  commands

export default class ToolBarEditPanelView extends Component {

  title    = 'Add item'
  subtitle = 'Add a new item to the tool bar.'

  static propTypes = {
    action: prop.instanceOf(ToolbarAction)
  }

  state = {
    text: ''
  }

  constructor (props) {
    super(props)
    this.emitter  = new Emitter()
    this.emitter.on('form-error', (error) => this.updateState({ error }))
    let { iconset, icon, command, tooltip } = this.props.action || {}
    this.state = {
      icon,
      iconset,
      command,
      tooltip,
    }
  }

  submit = (e) => {
    let data = this.form.data
    let validation = this.isValid(data)
    if (validation === true)
      this.dispatch(e, 'submit', data)
    else {
      this.emitter.emit('form-error', validation)
      e.stopImmediatePropagation()
    }

    e.preventDefault()
    return false
  }

  cancel = (e) =>
    this.dispatch(e, 'cancel')

  dispatch (origin, name, detail) {
    let event = new CustomEvent(name, { detail })
    this.form.parentElement.dispatchEvent(event)

    if (!origin.isDefaultPrevented())
      origin.preventDefault()
    return false
  }

  initializeForm (ref) {
    if (!ref)
       return
    if (!this.form) {
      this.form = ref
      Object.defineProperty(this.form, 'data', { get: serializeFormData.bind(ref, true) })
    }
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

    let grammar = atom.grammars.getGrammars().find(o => o.scopeName.search('.js') > 0)
    let editor  = atom.textEditors.build({ grammar })
    let command = this.props.action.properties.get('command')
    if (command)
      editor.setText(command)
    // editor.element.addEventListener('focus', console.log)
    editor.element.setAttribute('name', 'command')
    editor.onDidStopChanging(() => this.updateState({ command: this.__editor.getText() }))
    return (this.__editor = editor)
  }

  updateState (props={}) {
    this.setState(props)
  }

  get items () {
    let { command } = this.state
    let text        = command || ''
    let icon        = 'terminal'
    let action      = ({ text }) => this.editor.setText(text)

    if (!text.match(/\n/g))
      return filterCommands(text)
      .map(name => ({ icon, name, action, }))
      .slice(0, MAX_ENTRIES_VISIBLE)
    return []
  }

  render () {

    let host

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

    let { items } = this
    let { error } = this.state

    const showErrors       = (field) => error && error.key === field ? error.exception.message : ''
    const attachEditor     = (ref) => ref ? ref.appendChild(this.editor.element) : null
    const onTooltipChanged = ({ text: tooltip }) => this.setState({ tooltip })
    const onIconsetChanged = ({ value: iconset }) => this.setState({ iconset })
    const onIconChanged    = ({ text: icon }) => this.setState({ icon })

    return <form ref={this.initializeForm.bind(this)} onSubmit={this.submit.bind(this)}>

      <header className='panel-heading padded'>
        <h3>{this.title}</h3>
        <p>{this.subtitle}</p>
      </header>

      <div className='panel-body padded'>

      <label className='form-group'>
        <div className="h5">Tooltip</div>
        <Editor
          name='tooltip'
          onChange={onTooltipChanged}
          initialValue={this.props.action.tooltip}
        />
        {showErrors('tooltip')}
      </label>

      <label className='form-group'>
        <div className="h5">Icon</div>
        <Editor
          name='icon'
          onChange={onIconChanged}
          initialValue={this.props.action.icon}
        />
        {showErrors('icon')}
      </label>

      <label className='form-group'>
        <div className="h5">Iconset</div>
        <select
          name='iconset'
          className="input-select"
          onChange={onIconsetChanged}
          value={this.state.iconset}>
          <option value='icon'>Octicons</option>
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

    <footer className='panel-footer padded' ref={ref => ref && (host = ref.parentElement)}>

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
            className='btn btn-error'
            onClick={() => toggleView(host)}>
            Cancel
          </button>

        </div>
      </section>

    </footer>
  </form>

  }
}
