module.exports = parse

var _ = require('./ground')

function parse (input, dicts, emit) {
  var code = {input: input, index: 0, column: 1, line: 1, current: input}
  var r = typeof dicts === 'function' ? dicts : _.resolve(dicts)
  var gnd = { resolve: r, unit: r('[]'), noop: r(''), cat: r(' ') }
  parseSequence(null, [], code, gnd, emit)
}

function parseItem (err, res, code, gnd, emit) {
  [
    parseWhitespace,
    parseSingleLineComment,
    parseMultiLineComment,
    parseQuotation,
    parseFloat,
    parseString,
    parseWord
  ].reduce(gnd.cat).apply(null, arguments)
}


function parseWhitespace (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  emit(err, res, match(/^[\s\t\r\n]+/, code) || code, gnd)
}

function parseSingleLineComment (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  emit(err, res, match(/^--.*\n?/, code) || code, gnd)
}

function parseMultiLineComment(err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  var open = match(/^-\[[^\]]*/, code) 
  if (!open) { return emit(err, res, code, gnd) }
  var close = match(/^([^-][^\]])*\]/, open)
  if (!close) { return emit("Expected '-]'", res, open, gnd) }
  emit(err, res, close, gnd)
}

function parseFloat (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  var c = match(/^\d+\.\d+/, code)
  if (!c) { return emit(err, res, code, gnd) }
  emit(err, gnd.unit(parseFloat(c.match[0])), c, gnd) 
}

function parseInt (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  var c = match(/^\d+/, code)
  if (!c) { return emit(err, res, code, gnd) }
  emit(err, gnd.unit(parseInt(c.match[0])), c, gnd) 
}

function parseString (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  var open = match(/^\"/, code)
  if (!open) { return emit(err, res, code, gnd) }
  var close = match(/^([^\\][^\"])*\"/, open)
  if (!close) { return emit("Expected '\"'", res, open, gnd) }
  var s = close.match[0].slice(-1)
  emit(err, gnd.unit(s), close, gnd)
}

function parseWord (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  var c = match(/[^\.\s\[\]\{\}\(\)]+/, code)
  if (!c) { return emit(err, res, code, gnd) }
  emit(err, gnd(c.match[0]), c, gnd) 
}

function parseQuotation (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  var open = match(/^\[/, code) 
  if (!open) { return emit(err, res, code, gnd) }
  parseSequence(err, [], open, gnd, function (err, res, code, gnd) {
    if (err) { return emit(err, res, code, gnd) ; }
    var close = match(/^\]/, code)
    if (!close) { return emit("Expected ']'", res, code, gnd) }
    res && emit(err, gnd.unit(res), close, gnd)
  })
}

function parseSequence (err, seq, code, gnd, emit) {
  if (err) { return emit(err, seq, code, gnd); }
  parseItem(err, null, code, gnd, function (err, res, code, gnd) {
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
    column:  lines.slice(-1)[0].length + 1,
    input:   code.input
  }
}
