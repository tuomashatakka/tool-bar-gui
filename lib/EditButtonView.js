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
        <h3>Add button</h3>
        <p>Add a new button to the toolbar</p>
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
      <div class='panel-footer btn-toolbar padded'>
        <div class='btn-group'>
          <button class='btn' type='submit'>Add</button>
          <button class='btn btn-error' type='cancel'>Cancel</button>
        </div>
      </div>
      `,
    ].join('\n')

    let item = make({ content, attrs, type })
    let submit = item.querySelector('[type="submit"]')
    let cancel = item.querySelector('[type="cancel"]')

    submit.addEventListener('click', () => this.onSubmit(item.getFormData()))
    cancel.addEventListener('click', () => this.hide())
    return item
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
      width: 240,
    }
    this.panel = atom.workspace.addRightPanel(args)
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
