'use babel'
import { Directory } from 'atom'
import { extname } from 'path'

const registeredCommandRegex = /\s*(('|")?([\w-:]+)('|")?)\s*/

function bootstrapScript (src) {
  return `'use babel'
export default function toolBarButtonOnClickHandler () { (function (atom) {

  try {
  ${src};
  }

  catch (description) {
    atom.notifications.addWarning(
    'Failed to run the callback script',
    { description })
  }

})(atom)}
  `
}

const getDirectory = () =>
  new Directory(atom
  .getStorageFolder()
  .pathForKey('custom-toolbar-scripts'))


async function getFile (name) {

  let folder = getDirectory()
  await folder.create()

  if (!name) name = 'index.js'
  else if (!extname(name)) name = name + '.js'

  let file = folder.getFile(name)
  await file.create()
  return file
}

export async function writeToFile (name, src='') {
  let file = await getFile(name)
  await file.write(bootstrapScript(src))
  return (...args) => require(file.getPath())(...args)
}

export function clearScriptsFolder () {
  let folder = getDirectory()
  console.log(folder)
}


export function composeCallback (cmd, btn) {

  let command = cmd ? cmd.trim() : null
  let name = btn && btn.tooltip ? btn.tooltip :
    typeof btn === 'string' ? btn :
    Math.random().toString().substr(2)

  if (!command)
    return () => alert("No callback in", btn)

  let hasLinebreaks = command.search(/\n/) > -1
  let wellFormed    = command.match(registeredCommandRegex)
  let workspace     = document.querySelector('atom-workspace')
  let formatPass    = wellFormed && wellFormed[0].length === command.trim().length
  let isCommand     = formatPass && !hasLinebreaks && atom.commands.registeredCommands[command]

  let dispatch = writeToFile(name, command)

  return async function () {
    // Primarily resolve as an internal command
    let view = atom.views.getView(atom.workspace.getActivePaneItem())
    if (isCommand)
      return dispatch( view, command )

    // Evaluate the script as-is as a last resort
    if (dispatch)
      try {
        console.warn(this, ...arguments, btn, command)
        let method = await dispatch
        console.warn(method, dispatch)
        return method(atom, command, view)
      }
      catch (description) { error(description)  }
    return null
  }
}

function error (description) {
  atom.notifications.addWarning(
    'Error while running ' + name + ' callback',
    { description })
}
