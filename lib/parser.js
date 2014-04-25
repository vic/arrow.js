module.exports = Parser

var Arrow = require('./arrow')
var Util  = require('./util')
var slicer = Util.slicer
var undefined

function Parser () {
  return Parser.current.apply(Parser, arguments)
}

var basicParser = function (code) {
  var dicts = [Arrow].concat(slicer(arguments,1))

  var resolveWord = function(word, dicts) {
    var dict = [].concat(dicts).filter(function(dict){ return dict && dict[word] })[0]
    if (!dict) { throw "Unknown word: " + word }
    return dict[word]
  } 

  var codeWords = code.split(/[\s\n\r\t]+/).filter(function(w) { return w.length > 0 })

  var arrows = codeWords.map(function(codeWord){

    if (codeWord.match(/^null$/)) {
      return Arrow.push(null) 
    }
    if (codeWord.match(/^undefined$/)) {
      return Arrow.push(undefined) 
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

  return Arrow.next.apply(null, arrows)
}

Parser.current = basicParser