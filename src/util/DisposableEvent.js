'use babel'
import { Disposable } from 'atom'


export default class DisposableEvent extends Disposable {

  constructor (target, type, handler, detail={}) {
    target = target || document
    let handle = (e) => handler(e, detail)
    let unbind
    super(() => unbind())
    let bind = () => target.addEventListener(type, handle)
    unbind = () => target.removeEventListener(type, handle)
    bind()
  }

}
