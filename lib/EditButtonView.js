'use babel'
import { make, select, editor, input } from './dom-utils'


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


export default class EditButtonView {

  onSubmit = () => {}
  onCancel = () => {}

  constructor () {

    let args = {
      item: this.render()
    }

    this.panel = atom.workspace.addRightPanel(args)
  }

  show () {
    this.panel.item.classList.remove('hidden')
  }

  hide () {
    this.panel.item.classList.add('hidden')
  }

  isVisible () {
    return !this.panel.item.classList.contains('hidden')
  }

  render () {

    let type = 'form'
    let attrs = { 'class': 'padded hidden' }
    let content = [

      `<header class='panel-header'>
        <h3>Add button</h3>
        <p>Add a new button to the toolbar</p>
      </header>`,
      input('Tooltip'),
      input('Icon'),
      select('Iconset', [
        ['', 'Glyphicons'],
        ['fa', 'Font Awesome'],
        ['ion', 'Ionicons'],
        ['mdi', 'Material Icons'],
      ]),
      editor('Callback'),
      `<div class='btn-toolbar'
        <div class='btn-group'>
          <button class='btn' type='submit'>Add</button>
          <button class='btn' type='cancel'>Cancel</button>
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
