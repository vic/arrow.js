var expect = require('chai').expect

describe('parser', function () {

  var _      = require('../lib/ground')
  var parser = require('../lib/parser')
  var gnd    = {
    ''   : _.noop,
    ' '  : _.cat,
    '[]' : _.unit
  } 

  it('parses empty program', function (done) {
    parser("", gnd, function (err, prg) {
      expect(err).to.eql(null)
      expect(prg).to.eql(gnd[''])
      done()
    })
  })

  it('parses an empty quotation', function (done) {
    parser("[]", gnd, function (err, prg, code) {
      expect(err).to.eql(null)
      expect(code.current).to.eql("")
      expect(code.line).to.eql(1)
      expect(code.column).to.eql(2)
      prg(function (v) { 
        expect(v).to.eql(gnd[''])
        done()
      })
    }) 
  })


})