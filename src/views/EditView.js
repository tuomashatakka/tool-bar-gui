/** @babel */

import self from 'autobind-decorator'
import React, { Component } from 'react'
import prop from 'prop-types'
import List from '../components/List'
import Editor from '../components/TextEditor'
import { toggleView } from '../util'
import ToolbarAction from '../models/ToolbarAction'
import { Emitter } from 'atom'

import { PureComponent } from 'react'


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
    let { iconset, icon, command, tooltip } = this.props.action || {}
    this.state = {
      icon,
      iconset,
      command,
      tooltip,
    }
  }

  componentWillMount () {
    this.emitter  = new Emitter()
    this.emitter.on('form-error', (error) => this.updateState({ error }))
  }

  componentWillUnmount () {
    this.emitter.dispose()
  }

  submit = (e) => {
    let data             = this.state
    let validationResult = this.isValid(data)
    if (validationResult === true)
      this.dispatch(e, 'submit', data)

    else {
      this.emitter.emit('form-error', validationResult)
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

  // eslint-disable-next-line class-methods-use-this
  isValid (data) {
    for (let [ key, value ] in data) {
      if (!value || (value.trim().length === 0))
        return {
          key,
          exception: new Error(`Invalid value for the '${key}' field; value must not be empty.`),
        }
    }
    return true
  }

  updateState (props={}) {
    this.setState(props)
  }

  get items () {
    let text        = this.state.command || ''
    let icon        = 'terminal'
    let action      = ({ text }) => this.setState({ command: text })

    if (text.match(/\n/g))
      return []

    try {
      return filterCommands(text)
        .map(name => ({ icon, name, action }))
        .slice(0, MAX_ENTRIES_VISIBLE) }

    catch (e) {
      if (atom.devMode)
        // eslint-disable-next-line no-console
        console.warn("Error in filtering atom commands:", e)
      return [] }
  }

  render () {

    let host
    const showErrors       = (field) =>
      this.state.error && (this.state.error.key === field)
      ? this.state.error.exception.message
      : ''
    const onTooltipChanged = ({ text: tooltip }) => this.setState({ tooltip })
    const onIconsetChanged = ({ value: iconset }) => this.setState({ iconset })
    const onIconChanged    = ({ text: icon }) => this.setState({ icon })

    return <form onSubmit={ this.submit } ref={ ref => ref && ( this.form = ref )}>

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
        <article>
          <CodeEditor
            value={ this.state.command }
            onChange={ command => this.updateState({ command }) }
            grammar={ atom
              .grammars
              .getGrammars()
              .find(o => o.scopeName.search('.js') !== -1) }
          />
        </article>
        <article className='commands-list'>
          <List items={ this.items } />
        </article>
        {showErrors('command')}
      </label>

    </div>

    <footer className='panel-footer padded' ref={ref => ref && (host = ref.parentElement)}>

      {/* <section className='instructions text-subtle hidden'>

        <p>
          You may choose to write either any javascript function (with window.atom
          available in its scope), for example <code>alert(3000)</code>
        </p>

        <p>
          Alternatively, you may choose for the button to dispatch an atom command by
          writing the command with its namespace to the callback field. For example
          <code>git-plus:add-all-and-commit</code>
        </p>

      </section> */}

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


class CodeEditor extends PureComponent {

  constructor (props) {
    super(props)
    console.log(props)
    this.editor = atom.textEditors.build(props)
  }

  componentWillUpdate (props) {
    this.hasChanged = props.value !== this.props.value

    if ('grammar' in props)
      this.editor.setGrammar(props.grammar)
    if (this.hasChanged && ('value' in props))
      this.editor.setText(props.value || '')
    if ('name' in props)
      this.editor.element.setAttribute('name', props.name)
  }

  componentDidUpdate () {
    // const focused = this.editor.element.hasFocus()
    // if (this.hasChanged && !focused)
    //   this.editor.element.focus()
  }

  componentWillMount () {
    const callback = () =>
      this.props.onChange(this.editor.getText())
    this.subscription = this.editor.onDidStopChanging(callback)
  }

  componentWillUnmount () {
    this.subscription.dispose()
  }

  @self
  // eslint-disable-next-line class-methods-use-this
  appendEditor (ref) {
    if (ref) {
      ref.insertAdjacentElement('beforeBegin', this.editor.element)
      ref.remove()
    }
  }

  render () {
    return <article ref={ this.appendEditor } />
  }
}
