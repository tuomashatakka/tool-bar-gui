/** @babel */
/** @jsx etch.dom */
import { make } from './dom-utils'

export default class RemoveButtonView {

  onSubmit = () => {}
  onCancel = () => {}
  buttons = []

  constructor () {

    this.item = this.render()
    let { item } = this
    let args = {
      item,
      className: 'tool-bar-button-remove-view'
    }
    this.panel = atom.workspace.addRightPanel(args)
    this.hide()
  }

  show () {
    this.updateList()
    this.item.parentElement.classList.remove('hidden')
}

  hide () {
    this.item.parentElement.classList.add('hidden')
  }

  isVisible () {
    return !this.item.parentElement.classList.contains('hidden')
  }

  updateList (list) {
    list = list || this.buttons
    this.list.innerHTML = null
    list.forEach((li, n) => {
      let content = li.tooltip
      let listItem = make({
        type: 'li',
        attrs: { 'class': 'list-item' },
        content: `<span class='icon icon-x'>${content}</span>`,
      })
      this.list.appendChild(listItem)
      listItem.addEventListener('click', () => {
        this.onSubmit(content)
        this.buttons = this.buttons.splice(n, 1)
      })
    })
  }

  render () {
    let type = 'ul'
    let attrs = { class: 'panel-body list-group select-list' }
    this.item = make({ content: `
      <header class='panel-heading'>
        <h3>Remove items</h3>
        <p>Remove items from the tool bar</p>
      </header>
    ` })
    this.list = make({ attrs, type })
    this.item.appendChild(this.list)
    return this.item
  }

}
