var Arrow = require('./arrow')

/* Combinators based on cake, k from http://tunes.org/~iepos/joy.html#cakek */
module.exports = _ = {}

function slicer(ary, from, to) {
  return Array.prototype.slice.apply(ary, [from, to])
}

// B A k = a
function k (A, B) {
  A.apply(null, slicer(arguments, 2))
}

// B A cake == Y X = {B a} {a B}
function cake (A, B) {
  var Y = function cakeY () {
    A.apply(null, [B].concat(slicer(arguments)))
  } 

  var X = function cakeX () {
    var rest = slicer(arguments, 0, -1)
    var cont = slicer(arguments, -1)[0]
    A.apply(null, rest.concat(function () {
      cont.apply(null, [B].concat(slicer(arguments)))  
    }))
  }

  var rest = slicer(arguments, 2, -1)
  var cont = slicer(arguments, -1)[0] 
  
  cont.apply(null, [X, Y].concat(rest))
}


// B A k    = a
_.k         = Arrow.lift(k)

// B A cake = {B a} {a B}
_.cake      = Arrow.lift(cake)

// B A zap  = B
//     zap  = {} k
_.zap       = Arrow.chain(Arrow.value(Arrow.noop), _.k)

// B A dip  = a B
//     dip  = cake k
_.dip       = Arrow.chain(_.cake, _.k)

// A B cons = {B a} 
//     cons = cake {} k
_.cons      = Arrow.chain(_.cake, Arrow.value(_.noop), _.k)

// A i      = a
//   i      = {{}} dip k
_.i         = Arrow.chain(Arrow.value(Arrow.value(Arrow.noop)), _.dip, _.k)

// A dup    = A A
//   dup    = {} cake dip dip
_.dup       = Arrow.chain(Arrow.value(Arrow.noop), _.cake, _.dip, _.dip)


