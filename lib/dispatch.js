'use babel'
import { writeFileSync as write,
         readFileSync as read,
         existsSync as exists } from 'fs'
import { join } from 'path'
import { File, Task } from 'atom'

const getScriptFile   = () => new File(atom.getStorageFolder().pathForKey(scriptFileName))
const getDispatchName = name => 'dispatch_' + name.replace(/([^\w]+)/g, '_')

const registeredCommandRegex = /\s*(('|")?([\w-:]+)('|")?)\s*/
const babelDefRegex   = /(\'|\")use babel(\'|\")\;?/g
const scriptFileName  = 'toolBarScripts.js'
const PACK            = 'tool-bar-gui'
const indent          = '  '
const scriptTemplate  = (name, src) => `
export function ${getDispatchName(name)} (cmd, ...args) {
${indent}${src.replace(/\n+/g, c => c + indent)}
}
`

function addScript (name, src) {
  return !hasScriptInFile(name) ?
    setScriptFileContents(scriptTemplate(name, src)) :
    null
}

const setScriptFileContents = (content='', append=true) => {

  let file  = getScriptFile()
  let fileContent = ''
  let readContent = () => new Promise(
    re => append ?
    file.read().then(content => re(content.replace(babelDefRegex, ''))) :
    re('')
  )

  return file
    .create()
    .then(() => readContent()
    .then(existingContent => file.write("'use babel';" + existingContent + content)))
}

const hasScriptInFile = (name) =>
  getScriptFile()
  .readSync()
  .search(`export function ${getDispatchName(name)}`) > -1

export const setupScripts = (commands={}) => Object
  .keys(commands)
  .reduce((acc, name) => ({ ...acc,
  [name]: composeCallback(commands[name], name) }), {})

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

  if (!isCommand)
    addScript(name, command)

  return () => {
    // Primarily resolve as an internal command
    if (isCommand)
      return atom.commands.dispatch( workspace, command )

    // Evaluate the script as-is as a last resort
    let dispatchName = getDispatchName(name)
    let scriptPath   = getScriptFile().path
    let dispatch     = require(scriptPath)[dispatchName]
    return dispatch ? dispatch.call(atom, command) : null
  }
}
