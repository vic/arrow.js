var _ = module.exports = {}

_.slice = function slice(ary, from, to) {
  return Array.prototype.slice.apply(ary, [from, to])
}

_.args = function args (ary, n) { 
  return _.slice(ary, n || 0, -1) 
}

_.cont = function cont (ary) { 
  return _.slice(ary, -1)[0] 
}

_.resolve = function resolve (dicts) {
  var dicts = [].concat(dicts)
  return function resolve (word) {
    var dict = dicts.filter(function(dict){ return dict && dict[word] })[0]
    if (!dict) { throw "Unknown word: '" + word + "'" }
    return dict[word]
  }
} 

_.noop = function noop () {
  var rest = _.args(arguments)
  var cont = _.cont(arguments)
  cont.apply(null, rest)
}

_.cat = function cat (A, B) {
  return function cat () {
    var args = _.args(arguments)
    var cont = _.cont(arguments)
    B.apply(null, args.concat(function chain_next () {
      A.apply(null, _.slice(arguments).concat(cont))
    }))
  }
}

_.unit = function unit (A) {
  return function unit () {
    var rest = _.args(arguments)
    var cont = _.cont(arguments)
    cont.apply(null, [A].concat(rest))
  }
}

_.gnd = { '': _.noop, ' ': _.cat, '[]': _.unit }

_.pure = function pure (A) {
  return function pure () {
    var args = _.args(arguments)
    var cont = _.cont(arguments)
    var result = A.apply(self, args)
    cont.apply(null, [].concat(result))
  }
}

