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
  <div class="controls">
    <label class="control-label">${name}</label>
    ${content}
  </div>`

export const select = (name, options) => {
  options = options.map(o => `<option value='${o[0]}'>${o[1]}</option>`).join('\n')
  return make({
    'class': 'control-group',
    content: inputContent(name, `
      <select
        class="form-control"
        name='${name.toLowerCase()}'>
        ${options}
      </select>
    `)})
   .outerHTML
}

export const editor = (name) => make({
  'class': 'control-group',
  content: inputContent(name, `
    <atom-text-editor name='${name.toLowerCase()}' rows=1 />
  `)})
  .outerHTML

export const input = (name) => make({
  'class': 'control-group',
  content: inputContent(name, `
    <input
      type='text'
      class="form-control"
      name='${name.toLowerCase()}'
      placeholder='${name}' />
  `)})
  .outerHTML
