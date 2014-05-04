var _ = require('./ground')
module.exports = $ = {}

// [B] [A] k    = A
$.k         = k

// [B] [A] cake = [[B] A] [A [B]]
$.cake      = cake

// [B] [A] zap  = [B]
$.zap       = [_.unit(_.noop), $.k].reduce(_.cat)
$.pop       = $.zap
$.drop      = $.zap

// B A dip  = a B
//     dip  = cake k
$.dip       = [$.cake, $.k].reduce(_.cat)

// A B cons = {B a} 
//     cons = cake {} k
$.cons      = [$.cake, _.unit(_.noop), $.k].reduce(_.cat)

// A i      = a
//   i      = {{}} dip k
$.i         = [_.unit(_.unit(_.noop)), $.dip, $.k].reduce(_.cat)

// A dup    = A A
//   dup    = {} cake dip dip
$.dup       = [_.unit(_.noop), $.cake, $.dip, $.dip].reduce(_.cat)


// B A swap = A B
$.swap      = [_.unit, $.dip].reduce(_.cat)

// B A K    = A
//          = B A swap zap = swap zap
$.K         = [$.swap, $.zap].reduce(_.cat)

// B A k = a
function k (A, B) {
  A.apply(null, _.slice(arguments, 2))
}

// B A cake == Y X = {B a} {a B}
function cake (A, B) {
  var Y = function cakeY () {
    A.apply(null, [B].concat(slice(arguments)))
  } 

  var X = function cakeX () {
    var rest = _.slice(arguments, 0, -1)
    var cont = _.slice(arguments, -1)[0]
    A.apply(null, rest.concat(function () {
      cont.apply(null, [B].concat(_.slice(arguments)))  
    }))
  }

  var rest = _.slice(arguments, 2, -1)
  var cont = _.slice(arguments, -1)[0] 
  
  cont.apply(null, [X, Y].concat(rest))
}

