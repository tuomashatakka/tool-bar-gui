const React = require('react')
const { Emitter, CompositeDisposable } = require('atom')

class ComponentElement extends HTMLElement {

  static setComponent (component) {
    this.component = component
  }

  setProps (props) {
    this.props = props
  }

  setState (state) {
    let component =
      this.component ||
      this.renderedComponent
    if (!component)
      throw new TypeError(`ComponentElement.setState called on an unmounted element or a stateless component`)
    if (component.updateState)
      component.updateState(state)
    else
      component.setState(state)
  }

  getProps () {
    if (this.renderedComponent)
      throw new TypeError(`ComponentElement.setProps called on a mounted element`)
    return this.props || {}
  }

  getComponentClass () {
    if (!this.constructor.component)
      throw new TypeError(`No component defined for ComponentElement`)
    return this.constructor.component
  }

  render () {
    let props = this.getProps()
    props.host = this
    let componentClass = this.getComponentClass()
    return React.createElement(componentClass, props)
  }

  mount () {
    let renderedComponent
    const { render } = require('react-dom')
    const component  = this.render()
    const callback   = this.mountedCallback.bind(this, renderedComponent)
    renderedComponent = render(component, this, callback)
    return renderedComponent
  }

  initialize () {
    if (this.initialized || this.destroyed)
      return

    this.subscriptions    = new CompositeDisposable()
    this.emitter          = new Emitter()
    this.mount            = this.mount.bind(this)
    this.render           = this.render.bind(this)
    this.destroy          = this.destroy.bind(this)
    this.mountedCallback  = this.mountedCallback.bind(this)
    this.initialized      = true
    this.emitter.emit('did-create')
  }

  connectedCallback () {
    this.initialize.call(this)
    this.renderedComponent = this.mount()
    this.emitter.emit('did-attach')
  }

  mountedCallback (component) {
    this.component = component
    this.emitter.emit('did-mount', component)
  }

  onCreate (callback) {
    this.emitter.on('did-create', callback.bind(this))
  }

  onAttach (callback) {
    this.emitter.on('did-attach', callback.bind(this))
  }

  onMount (callback) {
    this.emitter.on('did-mount', callback.bind(this))
  }

  destroy () {
    if (!this.destroyed) {
      this.destroyed = true
      this.subscriptions.dispose()
      this.remove()
    }
  }
}

module.exports = function connect (tagName, component=null, instanceProperties={}) {

  if (!component) {
    component = tagName
    tagName = component.tagName || 'component-element'
  }

  try {
    let properties = { tagName }
    let prototype  = constructFromObject(properties, instanceProperties)
    customElements.define(tagName, prototype)
  }
  catch (e) {
    throw new Error(e)
  }
  finally { /* --- */ }

  let componentElement = customElements.get(tagName)
  componentElement.setComponent(component)

  return (props) => {
    let el = document.createElement(tagName)
    if (props)
      el.setProps(props)
    return el
  }

}

function constructFromObject (staticProperties, instanceProperties) {

  class ADHD extends ComponentElement {
    constructor () {
      super()
      Object.defineProperties(this, mapObjectToPropertyDescriptors(instanceProperties))
    }
  }

  Object.defineProperties(ADHD, mapObjectToPropertyDescriptors(staticProperties))
  return ADHD
}


function mapObjectToPropertyDescriptors (p) {
  for (let key in p) {
    p[key] = { value: p[key] }
  }
  return p
}
