var Arrow = require('./arrow')

/* Combinators based on cake, k from http://tunes.org/~iepos/joy.html#cakek */
module.exports = _

function slicer(ary, from, to) {
  return Array.prototype.slice.apply(ary, [from, to])
}

// V A N set
function set (name, owner, value) {
  var rest = slicer(arguments, 3, -1)  
  var cont = slicer(arguments, -1)[0]
}

function _ (f) { 
  return function () { f.apply(null, arguments) } 
}

// noop =
function noop () {
  var rest = slicer(arguments, 0, -1)
  var cont = slicer(arguments, -1)[0] 
  cont.apply(null, rest)
}

// B A cat = {B A} 
function cat (A, B) {
  function catB () {
    var cont = slicer(arguments, -1)[0]
    function catA () {
      var rest = slicer(arguments)
      A.apply(null, rest.concat(cont)) 
    }
    var rest = slicer(arguments, 0, -1)
    B.apply(null, rest.concat(catA))
  }
  var rest = slicer(arguments, 2, -1)
  var cont = slicer(arguments, -1)[0]
  cont.apply(null, [catB].concat(rest))
}

// A unit = {A}
function unit (A) {
  var rest = slicer(arguments, 1, -1)
  var cont = slicer(arguments, -1)[0] 
  function unitA () {
    var rest = slicer(arguments, 0, -1)
    var cont = slicer(arguments, -1)[0]
    cont.apply(null, [A].concat(rest))
  }
  cont.apply(null, [unitA].concat(rest))
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

_.noop      = _(noop)
_.unit      = _(unit)
_.cat       = _(cat)


// B A k    = a
_.k         = _(k)

// B A cake = {B a} {a B}
_.cake      = _(cake)

// B A zap  = B
//     zap  = {} k
_.zap       = [_.unit(_.noop), _.k].reduce(_.cat)
_.pop       = _.zap
_.drop      = _.zap

// B A dip  = a B
//     dip  = cake k
_.dip       = [_.cake, _.k].reduce(_.cat)

// A B cons = {B a} 
//     cons = cake {} k
_.cons      = [_.cake, _.unit(_.noop), _.k].reduce(_.cat)

// A i      = a
//   i      = {{}} dip k
_.i         = [_.unit(_.unit(_.noop)), _.dip, _.k].reduce(_.cat)

// A dup    = A A
//   dup    = {} cake dip dip
_.dup       = [_.unit(_.noop), _.cake, _.dip, _.dip].reduce(_.cat)


// B A swap = A B
_.swap      = [_.unit, _.dip].reduce(_.cat)

// B A K    = A
//          = B A swap zap = swap zap
_.K         = [_.swap, _.zap].reduce(_.cat)
