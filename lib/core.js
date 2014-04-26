/****


Arrow.push = function (value) {
  return Arrow(function (input, output) {
    input(function () {
      output.apply(null, [value].concat(slicer(arguments)))
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

***/