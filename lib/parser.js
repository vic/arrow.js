module.exports = Parser

var resolveWord = function (word, dicts) {
  var dict = [].concat(dicts).filter(function(dict){ return dict && dict[word] })[0]
  if (!dict) { throw "Unknown word: " + word }
  return dict[word]
} 

var parseWord = function (word, dicts, undefined) {
  if (word.match(/^null$/)) {
    return null
  }
  if (word.match(/^undefined$/)) {
    return undefined
  }
  if (word.match(/^["'].*['"]$/)) { 
    return word.slice(1,-1)
  }
  if (word.match(/^\d+\./)) { 
    return word * 1.0
  }
  if (word.match(/^\d+$/)) {
    return word * 1
  }  
  if (word.match(/^\{.*\}$/)) {
    word = word.slice(1, -1)
    return resolveWord(word, dicts)  
  }

  return word.split(/\./).
    filter(function (w) { return w.length > 0 }).
    reduce(function (prev, curr) { return resolveWord(curr, prev) }, dicts)
}

var splitWords = function (code) {
  return code.split(/[\s\n\r\t]+/).filter(function(w) { return w.length > 0 })
}

function Parser (code) {
  var dicts   = Array.protype.slice.call(arguments)
  var isArrow = resolveWord('Arrow.isArrow', dicts)
  var value    = resolveWord('Arrow.value', dicts)
  var next    = resolveWord('Arrow.next', dicts)
  var arrows = splitWords(code).map(function(word){
    var parsed = parseWord(word, dicts)
    if (isArrow(word)) {
      return word
    } else {
      return value(word)
    }
  }) 
  return next.apply(null, arrows)
}

