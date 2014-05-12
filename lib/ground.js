var _ = module.exports = {}

_.slice = function _slice(ary, from, to) {
  return Array.prototype.slice.apply(ary, [from, to])
}

_.args = function _args (ary, n) { 
  return _.slice(ary, n || 0, -1) 
}

_.cont = function _cont (ary) { 
  return _.slice(ary, -1)[0] 
}

_.resolve = function _resolve (dicts) {
  var dicts = [].concat(dicts)
  return function resolve (word) {
    var dict = dicts.filter(function(dict){ return dict && dict[word] })[0]
    if (!dict) { throw "Unknown word: '" + word + "'" }
    return dict[word]
  }
} 

_.noop = function _noop () {
  var rest = _.args(arguments)
  var cont = _.cont(arguments)
  cont.apply(null, rest)
}

_.cat = function _cat (B, A) {
  return function cat () {
    var args = _.args(arguments)
    var cont = _.cont(arguments)
    B.apply(null, args.concat(function chain_next () {
      A.apply(null, _.slice(arguments).concat(cont))
    }))
  }
}

_.unit = function _unit (A) {
  return function unit () {
    var rest = _.args(arguments)
    var cont = _.cont(arguments)
    cont.apply(null, [A].concat(rest))
  }
}

_.gnd = { '': _.noop, ' ': _.cat, '[]': _.unit }

_.pure = function _pure (A, arg_count, pop_count, self) {
  return function pure () {
    var cont   = _.cont(arguments)
    var input  = _.args(arguments)
    var args   = arg_count ? _.slice(input, 0, arg_count) : input
    var rest   = arg_count ? _.slice(input, arg_count) : []
    var output = [].concat(A.apply(self, args))
    var result = pop_count ? _.slice(output, pop_count) : output
    cont.apply(null, [].concat(result, rest))
  }
}
