module.exports = Parser

var resolveWord = function (word, dicts) {
  var dict = [].concat(dicts).filter(function(dict){ return dict && dict[word] })[0]
  if (!dict) { throw "Unknown word: " + word }
  return dict[word]
} 

var parseWord = function (word, dicts, Arrow, undefined) {
  if (word.match(/^null$/)) {
    return Arrow.value(null)
  }
  if (word.match(/^undefined$/)) {
    return Arrow.value(undefined)
  }
  if (word.match(/^["'].*['"]$/)) { 
    return Arrow.value(word.slice(1,-1))
  }
  if (word.match(/^\d+\./)) { 
    return Arrow.value(word * 1.0)
  }
  if (word.match(/^\d+$/)) {
    return Arrow.value(word * 1)
  }  
  if (word.match(/^\{.*\}$/)) {
    word = word.slice(1, -1)
    return resolveWord(word, dicts)  
  }

  return word.split(/\./).
    filter(function (w) { return w.length > 0 }).
    reduce(function (prev, curr) { return resolveWord(curr, prev, Arrow) }, dicts)
}

var splitWords = function (code) {
  return code.split(/[\s\n\r\t]+/).filter(function(w) { return w.length > 0 })
}

function Parser (code) {
  var dicts  = Array.prototype.slice.apply(arguments, [1])
  var Arrow  = resolveWord('Arrow', dicts)
  var arrows = splitWords(code).map(function(word){
    var arrow = parseWord(word, dicts, Arrow)
    arrow.word = word
    return arrow
  }) 
  return Arrow.chain.apply(null, arrows)
}

