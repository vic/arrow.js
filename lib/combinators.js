var $ = module.exports = {}
var _ = require('./ground')
var parser = require('./parser')

// [B] [A] k    = A
$.k             = k

// [B] [A] cake = [[B] A] [A [B]]
$.cake          = cake

// [B] [A] zap  = [B]
s('zap          = pop = drop = [] k')

// [B] [A] dip  = A [B]
s('dip          = cake k')

// [B] [A] cons = [[B] A]
s('cons         = cake [] k')

// [A] i        = A
s('i            = [[]] dip k')

// [A] dup      = [A] [A]
s('dup          = [] cake dip dip')

// A unit       = [A]
$.unit          = _.pure(_.unit, 1)

// [B] [A] swap = [A] [B]
s('swap         = unit dip')

// [A] I = [A]
s('I = noop')

// [B] [A] K    = [A]
s('K            = swap zap')

//• S x y z = x z (y z)
//  S x y z = x(z)(y(z)) = x[z][y[z]] = [[z] y] [[z] x] i
//  z y x S = 
// [C] [B] [A] S = [[C] B] [[C] A] i i
// [C] [B] [A] [[dup] dip cons] dip [swap] dip cons = [[C] B] [[C] A]

//  [[C] B] [C] A


function k (A, B) {
  A.apply(null, _.slice(arguments, 2))
}

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
  parser(code.slice(-1)[0], [$, gnd, _.gnd], function (err, a, c) { 
    code.slice(0, -1).forEach(function (n) { $[n] = a })
  })
}

