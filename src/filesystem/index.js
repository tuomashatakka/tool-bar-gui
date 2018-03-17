'use babel'
import { Directory } from 'atom'
import { extname, join } from 'path'
import { getActionByItem } from '../models/ToolbarItem'
import { existsSync, unlinkSync } from 'fs'

const registeredCommandRegex = /\s*(('|")?([\w-:]+)('|")?)\s*/

function bootstrapScript (src) {
  return `'use babel'
export default function toolBarButtonOnClickHandler () {
  (function (atom) {
  ${src};
  })(atom)}`
}

const getScriptsPath = () => {
  // const [ major, minor, patch ] = atom.getVersion().split('.')
  if (typeof atom.getConfigDirPath === 'function')
    return join(
      atom.getConfigDirPath(),
      'storage',
      'custom-toolbar-scripts'
    )

  else if (typeof atom.getStorageFolder === 'function')
    return atom
      .getStorageFolder()
      .pathForKey('custom-toolbar-scripts')

  else
    atom.notifications.addError('Could not resolve a path for storage folder. Weird.')
}

const getDirectory = () =>
  new Directory(getScriptsPath())


export async function getFile (name) {

  let folder = getDirectory()
  await folder.create()

  if (!name) name = 'index.js'
  else if (!extname(name)) name = name + '.js'

  let file = folder.getFile(name)
  if (!file.existsSync())
    await file.create()
  return file
}

export function clearScripts () {
  let directory = getDirectory()
  let entries = directory.getEntriesSync()
  for (let entry of entries)
    removeScript(entry)
  try {
    if (directory.getEntriesSync().length === 0)
      unlinkSync(directory.getPath())
  }
  catch (e) { /**/ }
}

export function removeScript (entry) {
  if (typeof entry !== 'string')
    if (entry.existsSync && entry.existsSync())
      unlinkSync(entry.getPath())
  else
    if (existsSync(entry))
      unlinkSync(entry)
}

export async function writeToFile (name, src='') {
  let file = await getFile(name)
  let path = file.getPath()
  removeScript(path)
  await file.write(bootstrapScript(src))
  return (...args) => require(path)(...args)
}

export async function composeCallback (item) {

  let action = getActionByItem(item)
  let command = item.command ? item.command.trim() : null
  let name = action.filename

  if (!command)
    return () => alert("No callback in", item)

  let hasLinebreaks = command.search(/\n/) > -1
  let wellFormed    = command.match(registeredCommandRegex)
  let formatPass    = wellFormed && wellFormed[0].length === command.trim().length
  let isCommand     = formatPass && !hasLinebreaks && atom.commands.registeredCommands[command]

  let dispatch = await writeToFile(name, command)

  return function () {
    // Primarily resolve as an internal command
    let view = atom.views.getView(atom.workspace.getActivePaneItem())
    if (isCommand)
      return atom.commands.dispatch( view, command )

    // Evaluate the script as-is as a last resort
    if (dispatch)
      try {
        let result = dispatch(atom, action, view)
        console.warn("Resulted:", result)
        return result
      }
      catch (message) {
        error(item, message)
      }
    return null
  }
}

function error (item, err) {
  let action = getActionByItem(item)
  let description = err.message

  atom.notifications.addWarning(
    `Could not run the callback function for ${action.name}`,
    { description,
      buttons: [{
        text: 'Edit function',
        onDidClick: action.openScriptFile
      }]
    })
}
