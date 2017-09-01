'use babel'
import { CompositeDisposable } from 'atom'
import Panel from '../util/Panel'

// Subscriptions

function subscribe (generator) {
  return (...args) => {
    let composite = new CompositeDisposable()
    composite.add(...generator(...args))
    return composite
  }
}

export const registerViewProviders = subscribe(view => [
  atom.workspace.addOpener(opener),
  atom.views.addViewProvider(Panel, getProviderForView(view)),
])

export const registerCommands = subscribe(panel => [
  atom.commands.add(
    'atom-workspace', {
      'tool-bar-gui:add-button': panel.toggle.bind(panel),
    }
  )
])


// Helper functions for activation

const URI_NAMESPACE = 'tool-bar-gui://'

const opener = uri =>
  uri.startsWith(URI_NAMESPACE) ? new Panel() : null

export const getProviderForView = view => model => {
  let el = document.createElement(view.tagName)
  el.model = model
  return el
}
