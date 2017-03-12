'use babel'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { Task } from 'atom'

const PACK = 'tool-bar-autonomy'
const scriptFileName = 'toolBarScripts.js'
const getScriptPath = () => join(atom.getStorageFolder().getPath(), scriptFileName)
const getDispatchName = name => 'dispatch_' + name.replace(/([^\w]+)/g, '_')
const scriptTemplate = (name, src) => `
export function ${getDispatchName(name)} (cmd, ...args)
  {${src}}
`

function addScript (name, src) {

  let path = getScriptPath()
  let content = scriptTemplate(name, src)
  let fileContent = readFileSync(path, 'utf8')
    .replace(/(\'|\")use babel(\'|\")\;?/g, '')

  if (fileContent.search(`export function ${getDispatchName(name)}`) > -1)
    return

  return writeFileSync(
    path,
    "'use babel';\n" + fileContent + content,
    'utf8')
}


export function composeCallback (cmd, btn) {

  let command = cmd ? cmd.trim() : null

  if (!command)
    return () => console.warn("No callback in", btn.name)

  let name = btn && btn.tooltip ?
    btn.tooltip :
    Math.random().toString().substr(2)

  let workspace = document.querySelector('atom-workspace')
  let wellFormed = command.match(/('|")([\w-:]+)('|")/)
  let formatPass = wellFormed && wellFormed[0].length === command.trim().length
  let hasLinebreaks =  command.search(/\n/) > -1
  let registeredCommand
  if (formatPass && !hasLinebreaks)
    addScript(name, cmd)

  return () => {

    registeredCommand = null
    if (formatPass && !hasLinebreaks)
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
