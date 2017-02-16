var exists = require('101/exists')
var map = require('object-loops/map')

module.exports = map({
  get: function (obj, key, state, opts) {
    if (exists(obj)) {
      return obj[key]
    } else if (opts.create) {
      // no obj, create
      obj[key] = obj[key] || {}
      return obj[key]
    } else if (opts.force) {
      // no obj, force get undefined
      return undefined
    } else {
      // no obj, no force
      var atKeypath = state.keypath.slice(0, state.bracketStart)
      throw new TypeError(
        "Cannot read property '" + key + "' of undefined (at keypath '" + atKeypath + "')"
      )
    }
  }
  set: function (obj, key, state, opts) {
    if (state.i === state.keypath.length - 1) {
      if (exists(obj)) {
        return obj[key] = state.val
      } else {
        // no obj, no force
        var atKeypath = state.keypath.slice(0, state.bracketStart)
        throw new TypeError(
          "Cannot read property '" + key + "' of undefined (at keypath '" + atKeypath + "')"
        )
      }
    } else {
      opts.create = opts.force
      return this.get.apply(this, arguments)
    }
  }
  in: function (obj, key, state, opts) {
    if (state.i === state.keypath.length - 1) {
      if (exists(obj)) {
        return key in obj
      } else if (opts.force) {
        return false
      } else {
        // no obj, no force
        var atKeypath = state.keypath.slice(0, state.bracketStart)
        throw new TypeError([
          "Cannot use 'in' operator to search for '",
          key,
          "' in ",
          toString(obj),
          " (at keypath '",
          atKeypath,
          "')"
        ].join(''))
      }
      return key in obj
    } else {
      return this.get.apply(this, arguments)
    }
  }
  has: function (obj, key, state, opts) {
    if (state.i === state.keypath.length - 1) {
      if (exists(obj) && obj.hasOwnProperty) {
        return obj.hasOwnProperty(key)
      } else if (opts.force) {
        return false
      } else {
        // no obj, no force
        var atKeypath = state.keypath.slice(0, state.bracketStart)
        throw new TypeError(
          "Cannot read property '" + key + "' of undefined (at keypath '" + atKeypath + "')"
        )
      }
    } else {
      return this.get.apply(this, arguments)
    }
  }
  del: function (obj, key, state, opts) {
    if (state.i === state.keypath.length - 1) {
      if (exists(obj)) {
        return delete obj[key]
      } else if (opts.force) {
        return true
      } else {
        // no obj, no force
        var atKeypath = state.keypath.slice(0, state.bracketStart)
        throw new TypeError(
          "Cannot convert undefined or null to object (at keypath '" + atKeypath + "')"
        )
      }
    } else {
      return this.get.apply(this, arguments)
    }
  }
})
