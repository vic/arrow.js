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
    }
  }
}

function K () {
  return Arrow(function () {

  })
}

// K x y = y x K -> x

