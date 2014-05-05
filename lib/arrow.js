var A = module.exports = {}
var _ = require('./ground')

A.noop = _.noop
A.pure = _.pure
A.next = _.cat
A.first = first


function first (arrow) {
  return function (A) {
    var rest = _.args(arguments, 1)
    var cont = _.cont(arguments)
    arrow.apply(null, [A].concat(function () {
      cont.apply(null, _.args(arguments).concat(rest))
    })) 
  } 
}

/*
function slicer (ary, from, to) {
  return Array.prototype.slice.apply(ary, [from, to])
}

function Arrow (cps, self) {
  return function Arrow_arrow () { cps.apply(self, arguments) }
}

Arrow.isArrow = function isArrow (fun) {
  return typeof fun === 'function' && fun.name == 'Arrow_arrow'
}

Arrow.noop = Arrow(function noop () {
  var args = slicer(arguments, 0, -1)
  var cont = slicer(arguments, -1)[0]
  cont.apply(null, args)
})

Arrow.lift = Arrow

Arrow.pure = function (func, self) {
  return Arrow(function pure () {
    var args = slicer(arguments, 0, -1)
    var cont = slicer(arguments, -1)[0]
    var result = func.apply(self, args)
    cont.apply(null, [].concat(result))
  })
}

Arrow.chain = function () {
  return slicer(arguments).reduce(function (previous, current) {
    return Arrow(function chain () {
      var args = slicer(arguments, 0, -1)
      var cont = slicer(arguments, -1)[0]
      previous.apply(null, args.concat(function chain_next () {
        current.apply(null, slicer(arguments).concat(cont))
      }))
    })
  })
}

Arrow.first = function (arrow) {
  return Arrow(function first (first) {
    var args = slicer(arguments, 1, -1)
    var cont = slicer(arguments, -1)[0]
    arrow.apply(null, [].concat(first, function first_apply () { 
      cont.apply(null, slicer(arguments).concat(args)) 
    }))
  })
}

Arrow.array = function (n) {
  return Arrow(function array () {
    var args = n ? slicer(arguments, 0, n) : []
    var rest = n ? slicer(arguments, n, -1) : slicer(arguments, 0, -1)
    var cont = slicer(arguments, -1)[0]
    cont.apply(null, [].concat([args], rest)) 
  })
}

Arrow.drop = function (n) {
  if (!n || n < 1) { return Arrow.noop }
  return Arrow(function drop () {
    var args = slicer(arguments, n, -1)
    var cont = slicer(arguments, -1)[0]
    cont.apply(null, args)
  })
}

Arrow.pureN = function (pure, i, j) {
  return Arrow.chain(Arrow.array(i), Arrow.first(Arrow.pure(pure)), Arrow.drop(j)) 
}

Arrow.liftN = function (cps, i, j) {
  return Arrow.chain(Arrow.array(i), Arrow.first(Arrow(cps)), Arrow.drop(j))
}

Arrow.value = function (value) {
  return Arrow.pureN(function () { return value })
}

Arrow.apply = Arrow(function apply (arrow) {
  arrow.apply(null, slicer(arguments, 1)) 
})

Arrow.inspect = Arrow.pure(function () { 
  var args = slicer(arguments)
  console.log(args)
  return args
})
*/