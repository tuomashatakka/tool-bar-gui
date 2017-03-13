'use babel'
import { writeFileSync as write,
         readFileSync as read,
         existsSync as exists } from 'fs'
import { join } from 'path'
import { Task } from 'atom'

const PACK = 'tool-bar-autonomy'
const scriptFileName = 'toolBarScripts.js'
const getScriptPath = () => join(atom.getStorageFolder().getPath(), scriptFileName)
const getDispatchName = name => 'dispatch_' + name.replace(/([^\w]+)/g, '_')
const registeredCommandRegex = /\s*(('|")?([\w-:]+)('|")?)\s*/
const babelDefRegex = /(\'|\")use babel(\'|\")\;?/g
const scriptTemplate = (name, src) => `
export function ${getDispatchName(name)} (cmd, ...args) {
${src} }
`

const setScriptFileContents = (content='', append=true) => {
  let fileContent = ''
  let path = getScriptPath()

  if (!exists(getScriptPath()))
    write(path, '')

  if (append && content)
    fileContent = read(path, 'utf8').replace(babelDefRegex, '')
  return write(path, "'use babel';" + fileContent + content)
}

const hasScriptInFile = (name) =>
  read(getScriptPath(), 'utf8').search(`export function ${getDispatchName(name)}`) > -1

function addScript (name, src) {
  if (hasScriptInFile(name)) return
  return setScriptFileContents(scriptTemplate(name, src))
}

export function setupScripts (commands={}) {
  setScriptFileContents()
  let callbacks = {}
  for (let name in commands) {
    callbacks[name] = composeCallback(commands[name], name)
  }
  return callbacks
}


export function composeCallback (cmd, btn) {
  let command = cmd ? cmd.trim() : null

  if (!command)
    return () => console.warn("No callback in", btn)

  let name = btn && btn.tooltip ? btn.tooltip :
             typeof btn === 'string' ? btn :
             Math.random().toString().substr(2)

  let workspace = document.querySelector('atom-workspace')
  let wellFormed = command.match(registeredCommandRegex)
  let formatPass = wellFormed && wellFormed[0].length === command.trim().length
  let hasLinebreaks =  command.search(/\n/) > -1
  let isCommand = (formatPass && !hasLinebreaks)

  if (!isCommand)
    addScript(name, cmd)

  return () => {
    let registeredCommand = null
    if (isCommand)
      registeredCommand = atom.commands.registeredCommands[command]

    // Primarily resolve as an internal command
    if (registeredCommand)
      return atom.commands.dispatch( workspace, command )

    // Evaluate the script as-is as a last resort
    let module = require(getScriptPath())
    let method = module[getDispatchName(name)]
    return method ? method() : null
  }
}
