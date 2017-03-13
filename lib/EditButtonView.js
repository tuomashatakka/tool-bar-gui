/** @babel */
/** @jsx etch.dom */

import { make, select, editor, input } from './dom-utils'
import etch from 'etch'

/**
 * A method for resolving all input elements within
 * a single parent and mapping their names and values
 * to an array consisting of [name, value] pairs
 *
 * @method serializeFormData
 *
 * @return {Array}          Input elements' data gathered in a single array
 */

function serializeFormData () {

  let inputs  = Array
    .from(this.querySelectorAll('input, textarea, select'))
    .map(field => [
      field.getAttribute('name'),
      field.value])

  let editors = Array
    .from(this.querySelectorAll('atom-text-editor'))
    .map(field => [
      field.getAttribute('name'),
      field.getModel().getText()])

  return inputs.concat(editors).map(field => ({
    name: field[0],
    value: field[1]
  }))

}

/**
 * Extension for the prototype for the {HTMLFormElement}
 * to serialize the form's data
 *
 * @method serialize
 */

HTMLFormElement.prototype.serialize = function () {
  return serializeFormData.call(this) }

/**
 * Using the serialize method defined above internally, reduces the
 * resulting array into an object of {name: value} pairs
 *
 * @method getFormData
 *
 * @return {Object}    Data for the form's input elements
 */

HTMLFormElement.prototype.getFormData = function () {

  return serializeFormData
    .call(this).reduce((tot, c) => ({
      ...tot, [c.name]: c.value }), {} )

}


export class ToolBarEditPanelView {
  constructor() {
    this.item = this.render()
  }

  show () {
    this.item.parentElement.classList.remove('hidden')
  }

  hide () {
    this.item.parentElement.classList.add('hidden')
  }

  isVisible () {
    return !this.item.parentElement.classList.contains('hidden')
  }

  render () {
    let type = 'form'
    let attrs = { style: 'min-width: 240px' }
    let content = [
      `<header class='panel-heading'>
        <h3>Add item</h3>
        <p>Add a new item to the tool bar.</p>
      </header>
      <main class='panel-body padded'>`,

      input('Tooltip'),
      select('Iconset', [
        ['', 'Glyphicons'],
        ['fa', 'Font Awesome'],
        ['ion', 'Ionicons'],
        ['mdi', 'Material Icons'],
      ]),
      input('Icon'),
      editor('Callback'),

      `</main>
      <div class='panel-footer padded'>
        <section class='btn-toolbar'>
          <div class='btn-group'>
            <button class='btn' type='submit'>Add</button>
            <button class='btn btn-error' type='cancel'>Cancel</button>
          </div>
        </section>
        <section class='instructions text-subtle'>
          <p>
            You may choose to write either any javascript function (with window.atom
            available in its scope), for example <code>git-plus:add-all-and-commit</code>
          </p>
          <p>
            Alternatively, you may choose for the button to dispatch an atom command by
            writing the command with its namespace to the callback field. For example
            <code>git-plus:add-all-and-commit</code>
          </p>
        </section>
      </div>
      `,
    ].join('\n')

    this.item = make({ content, attrs, type })
    let submit = this.item.querySelector('[type="submit"]')
    let cancel = this.item.querySelector('[type="cancel"]')

    submit.addEventListener('click', () => this.onSubmit(this.item.getFormData()))
    cancel.addEventListener('click', () => this.hide())
    return this.item
  }
}


export default class EditButtonView {

  onSubmit = () => {}
  onCancel = () => {}

  constructor () {

    this.element = new ToolBarEditPanelView()
    this.element.onSubmit = (...args) => this.onSubmit(...args)
    this.element.onCancel = (...args) => this.onCancel(...args)
    let { item } = this.element
    let args = {
      item,
      className: 'tool-bar-button-edit-view',
    }
    this.panel = atom.workspace.addRightPanel(args)
    this.hide()
  }

  show () {
    this.element.show()
  }

  hide () {
    this.element.hide()
  }

  isVisible () {
    console.log("ToolBarEditPanelView.isVisible", this.element.isVisible())
    return this.element.isVisible()
  }

}
