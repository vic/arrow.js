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
    parseFloatLiteral,
    parseIntLiteral,
    parseStringLiteral,
    parseWord
  ].reduce(_.cat).apply(null, arguments)
}


function parseWhitespace (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  emit(err, res, match(/^[\s\t\r\n]+/, code) || code, gnd)
}

function parseSingleLineComment (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  emit(err, res, match(/^--.*[\r\n]/, code) || code, gnd)
}

function parseMultiLineComment(err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  var open = match(/^-\[[^\]]*/, code) 
  if (!open) { return emit(err, res, code, gnd) }
  var close = match(/^([^-][^\]])*\]/, open)
  if (!close) { return emit("Expected '-]'", res, open, gnd) }
  emit(err, res, close, gnd)
}

function parseFloatLiteral (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  var c = match(/^\d+\.\d+/, code)
  if (!c) { return emit(err, res, code, gnd) }
  emit(err, gnd.unit(parseFloat(c.match[0])), c, gnd) 
}

function parseIntLiteral (err, res, code, gnd, emit) {
  if (err || res) { return emit(err, res, code, gnd); }
  var c = match(/^\d+/, code)
  if (!c) { return emit(err, res, code, gnd) }
  emit(err, gnd.unit(parseInt(c.match[0])), c, gnd) 
}

function parseStringLiteral (err, res, code, gnd, emit) {
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
  var c = match(/^[\w][^\s\r\n\"\'\{\}\[\]\(\)\.]*/, code)
  if (!c) { return emit(err, res, code, gnd) }
  emit(err, gnd.resolve(c.match[0]), c, gnd) 
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
  parseItem(err, null, code, gnd, function (err, res, c, gnd) {
    if (err) { return emit(err, res, c, gnd); }
    if (res) { return parseSequence(err, seq.concat([res]), c, gnd, emit); }
    if (c.index > code.index) { return parseSequence(err, seq, c, gnd, emit); }
    var prog = seq.length == 0 ? gnd.noop : seq.reduce(gnd.cat)
    emit(err, prog, c, gnd)
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
