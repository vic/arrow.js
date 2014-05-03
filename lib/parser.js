module.exports = parse

function resolver (dicts) {
  var dicts = [].concat(dicts)
  return function (word) {
    var dict = dicts.filter(function(dict){ return dict && dict[word] })[0]
    if (!dict) { throw "Unknown word: '" + word + "'" }
    return dict[word]
  }
} 

function parse (input, dicts, emit) {
  var code = {input: input, index: 0, column: 0, line: 0, current: input}
  var r = typeof dicts === 'function' ? dicts : resolver(dicts)
  var gnd = {resolve: r, unit: r('[]'), noop: r(''), cat: r(' ') }
  parseSequence(null, [], code, gnd, emit)
}

function parseProgram (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd, emit); }
  if (code.current.length == 0) { return emit(err, null, code, gnd, emit); }
  [
    parseWhitespace,
    parseSingleLineComment,
    parseMultiLineComment,
    parseQuotation,
    parseFloat,
    parseString,
    parseWord,
    parseProgram,
  ].reduce(gnd.cat)(err, res, code, gnd, emit)
}

function parseWhitespace (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd, emit); }
  emit(err, res, match(/^[\s\t\r\n]+/, code) || code, gnd)
}

function parseSingleLineComment (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd, emit); }
  emit(err, res, match(/^--.*\n?/, code) || code, gnd)
}

function parseMultiLineComment(err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd, emit); }
  var c = match(/^-\[[^\]]*/, code) 
  if (!c) { return emit(err, res, code, gnd) }
  c = match(/^([^-][^\]])*\]/, c)
  if (!c) { return emit("Expected '-]'", res, c, gnd) }
  emit(err, res, c, gnd)
}

function parseFloat (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd, emit); }
  var c = match(/^\d+\.\d+/)
  if (!c) { return emit(err, res, code, gnd) }
  emit(err, gnd.unit(parseFloat(c.match[0])), c, gnd) 
}

function parseInt (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd, emit); }
  var c = match(/^\d+/)
  if (!c) { return emit(err, res, code, gnd) }
  emit(err, gnd.unit(parseInt(c.match[0])), c, gnd) 
}

function parseString (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd, emit); }
  var c = match(/^\"/)
  if (!c) { return emit(err, res, code, gnd) }
  c = match(/^([^\\][^\"])*\"/, c)
  if (!c) { return emit("Expected '\"'", res, c, gnd) }
  var s = c.match[0].slice(-1)
  emit(err, gnd.unit(s), c, gnd)
}

function parseWord (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd, emit); }
  var c = match(/[^\.\s\[\]\{\}\(\)]+/)
  if (!c) { return emit(err, res, code, gnd) }
  emit(err, gnd(c.match[0]), c, gnd) 
}

function parseQuotation (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd, emit); }
  var c = match(/^\[/, code) 
  if (!c) { return emit(err, res, code, gnd) }
  parseSequence(err, [], c, gnd, function (err, res, code, gnd) {
    if (err || res) { return emit(err, res, code, gnd) ; }
    c = match(/^\]/)
    if (!c) { return emit("Expected ']'", res, code, gnd) }
    res && emit(err, gnd.unit(res), c, gnd)
  })
}

function parseSequence (err, seq, code, gnd, emit) {
  if (err) { return emit(err, seq, code, gnd, emit); }
  parseProgram(err, null, code, gnd, function (err, res, code, gnd) {
    if (err || res) { return emit(err, res, code, gnd); }
    if (res) { parseSequence(err, seq.concat([res]), code, gnd) }
    var prog = seq.length == 0 ? gnd.noop : seq.reduce(gnd.cat)
    emit(err, prog, code, gnd)
  })
}


function match (regexp, code) {
  var match = code.current.match(regexp)
  if (!match) { return null; }
  var offset = match.index + match[0].length
  var lines = match[0].split(/[\r\n]/)
  return {
    match:   match,
    current: code.current.slice(offset),
    index:   code.index + offset,
    line:    code.line  + lines.length - 1,
    column:  lines.slice(-1)[0].length,
    input:   code.input
  }
}
