var bird = {}
var comb = {}
module.exports = { bird: bird, combinator: comb }

var Arrow = require('./arrow')

comb['K'] = bird['Kestrel'] = K

function K (value) {
  return Arrow.push(value)
}

