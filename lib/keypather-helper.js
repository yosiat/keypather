const assert = require('assert')

const debug = require('debug')('perf')
const stringReduce = require('string-reduce')

const slash = '\\'.charAt(0)

module.exports = keypatherHelper

function keypatherHelper (args, action, opts) {
  debug('keypather %O %O', obj, keypath)
  var initialState = {
    ctx: args[0],
    // static args
    keypath: args[1],
    val: args[2],
    funcArgs: args.slice(3),
    // loop state
    i: null,
    character: null,
    // position state
    bracketStart: null,
    keyStart: 0,
    keyEnd: null,
    insideBracket: false,
    closedKey: true,  // init w/ true
    insideBracketString: false,
    closedBracketString: false,
    stringCharacter: null
  }
  var state = stringReduce(keypath, reducer, initialState)
  function reducer (state, character, i, string) {
    state.i = i
    state.character = character
    if (character === slash && keypath.charAt(i - 1) !== slash) {
      debug('skip %O', slash)
      if (state.keyStart === i) {
        state.keyStart++
      }
      i++
    } else if (state.insideBracketString) {
      // state: inside bracket, inside string
      if (character === state.stringCharacter) {
        state.keyEnd = keypath.charAt(i - 1) === slash
          ? i - 1
          : i
        state.insideBracketString = false
        state.stringCharacter = null
        state.closedBracketString = true
      }
    } else if (state.closedBracketString) {
      // state: inside bracket, closed string
      assert(character === ']', 'Error parsing keypath at ' + i + ' ' + character)
      state.insideBracket = false
      state.closedBracketString = false
    } else if (state.insideBracket) {
      // state: inside bracket, no bracket string
      assert(character === '"' || character === "'", 'Error parsing keypath at ' + i + ' ' + character)
      state.insideBracketString = true
      state.stringCharacter = character
      state.keyStart = i + 1
      state.keyEnd = null
    } else if (character === '[') {
      if (state.keyStart > 0) {
        debug('action1 %O %O %O', key, state.ctx, character)
        key = keypath.substring(state.keyStart, state.keyEnd || i)
        state.ctx = action(state.ctx, key, state, character, i, string)
      }
      state.bracketStart = i
      state.insideBracket = true
      state.bracketStart = null
    } else if (character === '.' || !character) {
      key = keypath.substring(state.keyStart, state.keyEnd || i)
      assert(key.length, 'Error parsing keypath at ' + i + ' ' + character) // ".."
      debug('action2 %O %O %O', key, state.ctx, character)
      state.ctx = action(state.ctx, key, state, character, i, string)
      state.keyStart = i + 1
      state.keyEnd = null
    } else {
      assert(/^[A-Za-z0-9_$]$/.test(character), 'Error parsing keypath at ' + i + ' ' + character)
    }
    debug('step %O %O %O', character, state, i)
    return state
  }
  return state.ctx
}
