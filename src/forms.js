'use babel'

/**
 * A method for resolving all input elements within
 * a single parent and mapping their names and values
 * to an array consisting of [name, value] pairs
 *
 * @method serializeFormData
 *
 * @return {Array}          Input elements' data gathered in a single array
 */

export function serializeFormData (asJSON=false) {

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

  let proc = asJSON
    ? src => src.reduce((r, field) => ({ ...r, [field[0]]: field[1] }), {})
    : src => src.map(field => ({
      name: field[0],
      value: field[1]
    }))

  return proc(inputs.concat(editors))
}


export function __main__ () {
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
}

export default __main__
