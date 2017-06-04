'use babel'
import { Disposable } from 'atom'


export default class DisposableEvent extends Disposable {

  constructor (type, handler, target) {
    const unbind = () => this.unbind()
    super(unbind)
    this.unbind  = this.unbind.bind(this)
    this.bind    = this.bind.bind(this)
    this.handler = (e) => handler(e)
    this.target  = target || document
    this.type    = type
    this.bind()
  }

  bind = () =>
    this.target.addEventListener(this.type, this.handler)

  unbind = () =>
    this.target.removeEventListener(this.type, this.handler)

}
