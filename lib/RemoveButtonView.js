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
    }
    this.panel = atom.workspace.addRightPanel(args)
  }

  show () {
    this.updateList()
    this.item.classList.remove('hidden')
}

  hide () {
    this.item.classList.add('hidden')
  }

  isVisible () {
    return !this.item.classList.contains('hidden')
  }

  updateList (list) {
    list = list || this.buttons
    this.item.innerHTML = null
    list.forEach(li => {
      let content = li.tooltip
      let listItem = make({
        content: `<span class='icon ion ion-ios-close'></span> ${content}`,
        attrs: {
          'class': 'btn' },
      })
      console.warn(listItem)
      this.item.appendChild(listItem)
      listItem.addEventListener('click', () => {
        console.log("onsubmit called", listItem, content)
        this.onSubmit(content)
      })
    })
  }

  render () {
    let attrs = { class: 'hidden' }
    this.item = make({ attrs })
    return this.item
  }

}
