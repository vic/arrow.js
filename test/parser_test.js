var expect = require('chai').expect

describe('parser', function () {

  var _      = require('../lib/ground')
  var parser = require('../lib/parser')

  it('parses empty program', function (done) {
    parser("", _.gnd, function (err, prg) {
      expect(err).to.eql(null)
      expect(prg).to.eql(_.noop)
      done()
    })
  })

  it('parses an empty quotation', function (done) {
    parser("[]", _.gnd, function (err, prg, code) {
      expect(err).to.eql(null)
      expect(code.current).to.eql("")
      expect(code.line).to.eql(1)
      expect(code.column).to.eql(2)
      prg(function (v) { 
        expect(v).to.eql(_.noop)
        done()
      })
    }) 
  })

  it('ignores single line comment', function (done) {
    parser('   -- hello \n -- world\n ', _.gnd, function (err, prg, code) {
      expect(prg).to.eql(_.noop)
      done()
    })
  })

  it('ignores multi line comment', function (done) {
    parser('   -[ hello \n -- world\n -] ', _.gnd, function (err, prg, code) {
      expect(prg).to.eql(_.noop)
      done()
    })
  })

  it('parses sequence of words', function (done) {
    var gnd = function (word) { return gnd[word] || word }
    gnd[' '] = function (a, b) { return [].concat(a, b) }
    parser(" a b c ", gnd, function (err, prg, code) {
      expect(err).to.eql(null) 
      expect(prg).to.eql(['a', 'b', 'c'])
      done()
    })
  })

  it('creates a chain of literals on stack', function (done) {
    parser("1 2 3", _.gnd, function (err, prg, code) {
      expect(err).to.eql(null) 
      done()
    })
  })


})