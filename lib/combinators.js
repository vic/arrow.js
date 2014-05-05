var $ = module.exports = {}
var _ = require('./ground')
var parser = require('./parser')

// ... [B] [A] k = ... A
$.k             = k

// ... [B] [A] cake = ... [[B] A] [A [B]]
$.cake          = cake

// [B] [A] zap  = [B]
s('zap = pop = drop = [] k')

// [B] [A] dip  = a B
//     dip      = cake k
s('dip = cake k')

// A B cons     = {B a}
//     cons     = cake {} k
s('cons = cake [] k')

// A i          = a
//   i          = {{}} dip k
s('i = [[]] dip k')

// A dup        = A A
//   dup        = {} cake dip dip
s('dup = [] cake dip dip')


// B A swap     = A B
s('swap = unit dip')

// B A K        = A
//              = B A swap zap                                         = swap zap
s('K = swap zap')

// B A k = a
function k (A, B) {
  A.apply(null, _.slice(arguments, 2))
}

// B A cake == Y X = {B a} {a B}
function cake (A, B) {
  var Y = function cakeY () {
    A.apply(null, [B].concat(_.slice(arguments)))
  } 

  var X = function cakeX () {
    var rest = _.args(arguments)
    var cont = _.cont(arguments)
    A.apply(null, rest.concat(function () {
      cont.apply(null, [B].concat(_.slice(arguments)))  
    }))
  }

  var rest = _.args(arguments, 2)
  var cont = _.cont(arguments)
  
  cont.apply(null, [X, Y].concat(rest))
}

function s (code) {
  var gnd = { noop: _.noop, unit: _.unit, cat: _.cat }
  var code = code.split(/\s*=\s*/)
  parser(code.slice(-1)[0], [$, gnd, _.gnd], function (err, a) { 
    code.slice(0, -1).forEach(function (n) { 
      console.log(n, a)
      $[n] = a
    })
  })
}

