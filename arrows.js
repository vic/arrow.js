var slicer = function (ary) {
  return function (from, to) {
    return Array.prototype.slice.apply(ary, [from, to])
  }
}

function Arrow (pipe) {
  if (! this instanceof Arrow) { return new Arrow(pipe) }
  this.pipe = pipe
  return this
}

Arrow.new = function (pipe) {
  var arrow = new Arrow(pipe)
  var fun = arrowFunction(arrow)
  fun.arrow = arrow
  return fun
}

Arrow.isArrow = function (fun) {
  return fun && (fun.arrow instanceof Arrow)
}

var arrowFunction = function (arrow) {
  return function () {
    var args = slicer(arguments)()
    var output = function() {}

    if (args.length > 0 && typeof args[args.length - 1] === 'function') {
      output = args.pop()
    }

    var input
    arrow.pipe(function(a_input){ input = a_input }, output) 
    input.apply(null, args)
  } 
}

Arrow.pure = function (f, self, argn) {
  return Arrow.new(function (input, output) {
    input(function () {
      var result = f.apply(self, slicer(arguments)(0, argn))
      var rest = argn ? slicer(arguments)(argn) : []
      output.apply(null, [].concat(typeof result !== 'undefined' ? result : [], rest))
    })
  }) 
}

Arrow.lift = function (f, self) {
  return Arrow.new(function (input, output) {
    input(function () {
      f.apply(self, [].concat(slicer(arguments)(), [output]))
    })
  })
}

Arrow.next = function (arrow_a, arrow_b) {
  return Arrow.new(function (input, output) {
    input(function () {
      arrow_a.apply(null, [].concat(slicer(arguments)(), [function () {
        arrow_b.apply(null, [].concat(slicer(arguments)(), [output]))
      }]))
    })
  })
}

Arrow.first = function (arrow) {
  return Arrow.new(function (input, output) {
    input(function (first) {
      var rest = slicer(arguments)(1)
      arrow.apply(null, [first, function(){
        output.apply(null, [].concat(slicer(arguments)(), rest)) 
      }])
    })
  }) 
}

Arrow.swap = Arrow.pure(function (a, b) { return [b, a] }, null, 2)

Arrow.second = function (arrow) {
  Arrow.next(Arrow.next(Arrow.swap, Arrow.first(arrow)), Arrow.swap)
}

Arrow.parallel = function (arrow_a, arrow_b) {
  return Arrow.next(Arrow.first(arrow_a), Arrow.second(arrow_b))
}

Arrow.dup = Arrow.pure(function (a) { return [a, a] }, null, 1)

Arrow.split = function (arrow_a, arrow_b) {
  return Arrow.next(Arrow.dup, Arrow.parallel(arrow_a, arrow_b)) 
}

Arrow.push = function (value) {
  return Arrow.pure(function(){ return [value].concat(slicer(arguments)()) })
}

var $a = function(code) {
  var dicts = [$a].concat(slicer(arguments)(1))

  var resolveWord = function(word, dicts) {
    var dict = [].concat(dicts).filter(function(dict){ return dict && dict[word] })[0]
    if (!dict) { throw "Unknown word: " + word }
    return dict[word]
  } 

  var codeWords = code.split(/[\s\n\r\t]+/).filter(function(w) { return w.length > 0 })

  var arrows = codeWords.map(function(codeWord){

    if (codeWord.match(/^null|nil$/)) {
      return Arrow.push(null) 
    }
    if (codeWord.match(/^undefined$/)) {
      var u;
      return Arrow.push(u) 
    }
    if (codeWord.match(/^["'].*['"]$/)) { 
      return Arrow.push(codeWord.slice(1,-1))
    }
    if (codeWord.match(/^\d+\./)) { 
      return Arrow.push(codeWord * 1.0)
    }
    if (codeWord.match(/^\d+$/)) {
      return Arrow.push(codeWord * 1)
    }

    var quote
    if (quote = codeWord.match(/^\{.*\}$/)) {
      codeWord = codeWord.slice(1, -1)
    }

    var word = codeWord.split(/\./)
    .filter(function(w) { return w.length > 0 })
    .reduce(function(prev, curr){
      return resolveWord(curr, prev) 
    }, dicts)

    var arrow
    if (quote || !Arrow.isArrow(word)) {
      arrow = Arrow.push(word)
    } else {
      arrow = word
    }
    return arrow
  }) 

  return arrows.reduce(function(prev, curr){ 
    if (prev) { 
      return Arrow.next(prev, curr)
    } else {
      return curr
    }
  })
}

$a.inspect = Arrow.pure(function (){
  var args = slicer(arguments)()
  console.log(args)
  return args
})

$a['+'] = Arrow.pure(function(a, b) { return a + b }, null, 2)
$a['*'] = Arrow.pure(function(a, b) { return a * b }, null, 2)
$a['/'] = Arrow.pure(function(a, b) { return a / b }, null, 2)
$a['=='] = Arrow.pure(function(a, b) { return a === b }, null, 2)


$a('{no} {yes} 42 foo.bar + "jojo" + "jojo63" == inspect', {
  twice: Arrow.split($a.inspect, $a.inspect),
  foo: { bar: 21 },
  yes: $a('"hello"'),
  no:  $a('"goodbye"')
})()
//Arrow.next(Arrow.push(42), $a.inspect)()