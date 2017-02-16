var actions = require('./lib/action.js')
var keypatherHelper = require('./lib/keypather-helper.js')

module.exports = [
  'get',
  'set',
  'del',
  'in',
  'has'
].reduce(function (kp, key) {
  kp[key] = function (obj, keypath, val) {
    var args = Array.prototype.slice.call(arguments)
    return keypatherHelper(args, actions[key])
  }
  return kp
}, {})
