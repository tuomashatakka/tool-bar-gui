'use babel'

export const make = ({ content, type, attrs, parent }) => {
  let el = document.createElement(type || 'div')

  el.innerHTML = content || ''
  attrs = attrs || {}
  for (let attr in attrs) {
    el.setAttribute(attr, attrs[attr])
  }

  if (parent)
    parent.appendChild(el)
  return el
}

const inputContent = (name, content) => `
  <label class='form-group'>
    <div class="h5">${name}</div>
    ${content}
  </label>`

export const select = (name, options) => {
  options = options.map(o => `<option value='${o[0]}'>${o[1]}</option>`).join('\n')
  return make({
    attrs: { 'class': 'field' },
    content: inputContent(name, `
      <select
        class="input-select"
        name='${name.toLowerCase()}'>
        ${options}
      </select>
    `)})
   .outerHTML
}

export const editor = (name) => make({
  attrs: { 'class': 'field' },
  content: inputContent(name,
    `<atom-text-editor name='${name.toLowerCase()}' class='editor' />`
  )})
  .outerHTML

export const input = (name) => make({
  attrs: { 'class': 'field' },
  content: inputContent(name, `
    <input
      type='text'
      class="input-text"
      name='${name.toLowerCase()}'
      placeholder='${name}' />
  `)})
  .outerHTML
