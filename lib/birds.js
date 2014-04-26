var b = {}, c = {}
module.exports = { birds: b, combinators: c }

var Arrow  = require('./arrow')
var Parser = require('./parser')

var scope = {
  Arrow: {
    value: Arrow.value,
    isArrow: Arrow.isArrow,
    next: function () {
      return Arrow.next.apply(null, Array.prototype.reverse.apply(arguments))
    }, next: Arrow.next
  },
  inspect: Arrow.pure(function () {
    console.log(Array.prototype.slice.apply(arguments))
    return Array.prototype.slice.apply(arguments)
  })
}

function K () {
  return Arrow(function () {

  })
}

// K x y = y x K -> x

//console.log(Parser("33 22 inspect", scope)(function(){}))


Arrow.chain(scope.Arrow.value(22), scope.Arrow.value(33), scope.inspect)(function (){})

