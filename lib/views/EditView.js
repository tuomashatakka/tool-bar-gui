/** @babel */

import React from 'react'
import { render } from 'react-dom'
import { composeCallback, setupScripts } from '../dispatch'
import BaseView from './BaseView'
import List from '../components/List'

const MAX_ENTRIES_VISIBLE = 15

export const commands = Object
  .keys(atom.commands.registeredCommands)
  .sort((a, b) => a > b ? 1 : a < b ? -1 : 0)

const filterCommands = q => q ? commands.filter(cmd => new RegExp(q).test(cmd)) : commands

export default class ToolBarEditPanelView extends BaseView {

  title = 'Add item'
  subtitle = 'Add a new item to the tool bar.'

  constructor (props) {
    super(props)
    this.state = {
      text: ''
    }
  }

  submit (data) {
    let cmd      = data.callback
    let callback = composeCallback(cmd, data)
    let button   = { ...data, cmd, callback }
    this.props.create(button)
  }

  get editor () {
    if (this.__editor)
      return this.__editor

    let gram = atom.grammars.getGrammars().find(o => o.scopeName.search('.js') > 0)
    let editor = atom.textEditors.build({
      grammar: gram
    })
    // editor.element.addEventListener('focus', console.log)
    editor.element.setAttribute('name', 'callback')
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
    const attachEditor = ref => ref ? ref.appendChild(this.editor.element) : null

    return <div className='panel-body padded'>

      <label className='form-group'>
        <div className="h5">Tooltip</div>
        <atom-text-editor mini name='tooltip' />
      </label>

      <label className='form-group'>
        <div className="h5">Icon</div>
        <atom-text-editor mini name='icon' />
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
      </label>

      <label className='form-group command-editor'>
        <div className="h5">Callback command/function</div>
        <article ref={attachEditor} />
        <article className='commands-list'>
          {<List items={items} />}
        </article>
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

      <section className='btn-toolbar'>
        <div className='btn-group'>

          <button
            className='btn'
            type='submit'>
            Add
          </button>

          <button
            onClick={(e) => {
              e.preventDefault()
              this.hide() }}
            className='btn btn-error'
            type='cancel'>
            Cancel
          </button>

        </div>
      </section>

      <section className='instructions text-subtle hidden' ref={bindInfo}>

        <p>
          You may choose to write either any javascript function (with window.atom
          available in its scope), for example <code>alert('kakka')</code>
        </p>

        <p>
          Alternatively, you may choose for the button to dispatch an atom command by
          writing the command with its namespace to the callback field. For example
          <code>git-plus:add-all-and-commit</code>
        </p>

      </section>

    </footer>
  }
}
