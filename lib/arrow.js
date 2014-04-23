module.exports = Arrow

var undefined
var Util = require('./util')
var slicer = Util.slicer

function Arrow (pipe) {
  if (! this instanceof Arrow) { 
    var arrow = new Arrow(pipe)
    var fun   = runner(arrow)
    fun.arrow = arrow
    return fun
  }
  this.pipe = pipe
  return this
}

Arrow.isArrow = function (fun) {
  return fun && (fun.arrow instanceof Arrow)
}

var runner = function (arrow) {
  return function () {
    var args = slicer(arguments,0, -1)
    var output = slicer(arguments,-1)[0] 
    if (typeof output !== 'function') { 
      args.push(output)
      output = function () {}
    }
    var input = function (_) { input = _ }
    arrow.pipe(input, output)
    input.apply(null, args)
  } 
}

Arrow.noop = Arrow(function (input, output) { 
  input(output)
})

Arrow.push = function (value) {
  return Arrow(function (input, output) {
    input(function () {
      output.apply(null, [value].concat(slicer(arguments)))
    }) 
  }) 
}

Arrow.pure = function (func, self) {
  return Arrow.lift(Util.cps(func, self), self)
}

Arrow.lift = function (cps, self) {
  return Arrow(function (input, output) {
    input(function () {
      cps.apply(self, slicer(arguments).concat([output]))
    }) 
  }) 
}

Arrow.next = function () {
  return slicer(arguments).reduce(function (prev, next) {
    return Arrow(function (input, output) {
      input(function () {
        prev.apply(null, slicer(arguments).concat([function () {
          next.apply(null, slicer(arguments).concat([output]))
        }]))
      }) 
    })
  })
}

Arrow.first = function (arrow) {
  return Arrow(function (input, output) {
    input(function (first) {
      var rest = slicer(arguments,1)
      arrow.apply(null, [first, function(){ 
        output.apply(null, slicer(arguments).concat(rest)) 
      }])
    }) 
  })
}

Arrow.swap = Arrow.pure(function (a, b) {
  return [b, a].concat(slicer(arguments,2))
})

Arrow.second = function (arrow) {
  Arrow.next(Arrow.swap, Arrow.first(arrow), Arrow.swap)
}

Arrow.parallel = function (arrow_a, arrow_b) {
  return Arrow.next(Arrow.first(arrow_a), Arrow.second(arrow_b))
}

Arrow.dup = Arrow.pure(function (a) {
  return [a, a].concat(slicer(arguments,1)) 
})

Arrow.fork = function (arrow_a, arrow_b) {
  Arrow.next(Arrow.dup, Arrow.parallel(arrow_a, arrow_b)) 
}

Arrow.left = function (arrow) {
  return Arrow(function (input, output) {
    input(function (left, right) {
      if (right) {
        output.apply(null, [undefined, right].concat(slicer(arguments,2)))
      } else {
        arrow.apply(null, [left].concat(slicer(arguments,2), function (left){
          output.apply(null, [left, undefined].concat(slicer(arguments,1)))
        }))
      }
    })
  })
}

Arrow.right = function (arrow) {
  return Arrow.next(Arrow.swap, Arrow.left(arrow), Arrow.swap)
}

Arrow.either = function (arrow_a, arrow_b) {
  return Arrow.next(Arrow.left(arrow_a), Arrow.right(arrow_b))
}

Arrow.join = Arrow.pure(function (left, right) {
  return [left || right].concat(slicer(arguments,2))
})

Arrow.choice = function (arrow_a, arrow_b) {
  return Arrow.next(Arrow.either(arrow_a, arrow_b), Arrow.join)
}

Arrow.loop = function (arrow, timeout) {
  return Arrow(function (input, output) {
    var C, timer
    input(function (a) {
      loop.apply(null, [a, C].concat(slicer(arguments,1)))
    })
    function loop(a, c) {
      timer && clearTimeout(timer)
      arrow.apply(null, [a,c].concat(slicer(arguments,2), function (b,c) {
        C = c
        var rest = slicer(arguments,2)
        output.apply(null, [b].concat(rest))
        var recurr = function () { 
          loop.apply(null, [a,c].concat(rest)) 
        }
        timeout ? timer = setTimeout(recurr, timeout) : recurr()
      }))
    }
  })
}

Arrow.apply = function () {
  return Arrow(function (input, output) {
    input(function (arrow) {
      arrow.apply(null, slicer(arguments,1).concat(output))
    })
  }) 
}

Arrow.each = Arrow(function (input, output) {
  input(function () {
    slicer(arguments).forEach(function(item){
      output(item)
    }) 
  })
})

