'use babel'
import { Directory } from 'atom'
import { extname } from 'path'
import { composeCallback, clearScriptsFolder } from './filesystem'

const getDispatchName = name => 'dispatch_' + name.replace(/([^\w]+)/g, '_').replace('-', '_')
const registeredCommandRegex = /\s*(('|")?([\w-:]+)('|")?)\s*/
const babelDefRegex   = /('|")use babel('|");?/g
// const scriptFileName  = 'toolBarScripts.js'
const scriptDirName   = 'tool-bar-scripts'
const indent          = '  '
const scriptTemplate  = (name, src) => `
export function ${getDispatchName(name)} (cmd, ...args) {
${indent}${src.replace(/\n+/g, c => c + indent)}
}
`

// async function getScriptFile (name=null) {
//
//   if (!name)
//     name = 'index.js'
//   if (!extname(name))
//     name = name + '.js'
//
//   let folder = getDirectory()
//   let file   = folder.getFile(name)
//
//   await file.create()
//   return file
// }

// function addScript (name, src) {
//   setScriptFileContents(name, scriptTemplate(name, src))
// }

// async function setScriptFileContents (name, content='', append=false) {
//
//   let file = await (name)
//   let fileContent
//   if (append)
//     fileContent = file.readSync()
//   fileContent = fileContent.replace(babelDefRegex, '')
//   file.writeSync("'use babel';" + fileContent + content)
// }

export { composeCallback }

export default function setupScripts (commands={}) {
  if (commands === 'clear')
    return clearScriptsFolder()
  let entries = Object
    .keys(commands)
    .reduce((acc, name) => ({ ...acc,
    [name]: composeCallback(commands[name], name) }), {})
  console.log("entries", entries)
  return entries
}

// function (cmd, btn) {
//
//   let command = cmd ? cmd.trim() : null
//   let name = btn && btn.tooltip ? btn.tooltip :
//     typeof btn === 'string' ? btn :
//     Math.random().toString().substr(2)
//
//   if (!command)
//     return () => alert("No callback in", btn)
//
//   let hasLinebreaks = command.search(/\n/) > -1
//   let wellFormed    = command.match(registeredCommandRegex)
//   let workspace     = document.querySelector('atom-workspace')
//   let formatPass    = wellFormed && wellFormed[0].length === command.trim().length
//   let isCommand     = formatPass && !hasLinebreaks && atom.commands.registeredCommands[command]
//
//   if (!isCommand)
//     addScript(name, command)
//
//   return async function () {
//     // Primarily resolve as an internal command
//     if (isCommand)
//       return atom.commands.dispatch( workspace, command )
//
//     // Evaluate the script as-is as a last resort
//     let dispatchName = getDispatchName(name)
//     let scriptPath   = await getScriptFile().path
//     let dispatch     = require(scriptPath)[dispatchName]
//     if (dispatch)
//       return dispatch.call(atom, command)
//     return null
//   }
// }
