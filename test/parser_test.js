var expect = require('chai').expect

describe('parser', function () {

  var parser  = require('../lib/parser')
  var combinators  = require('../lib/combinators')
  var gnd = {
    '':   combinators.noop,
    ' ':  combinators.cat,
    '[]': combinators.unit
  }

  it('parses empty program', function (done) {
    parser("", gnd, function (err, prg) {
      expect(err).to.eql(null)
      expect(prg).to.eql(combinators.noop)
      done()
    })
  })

  it('parses an empty quotation', function (done) {
    parser("[]", gnd, function (err, prg) {
      expect(err).to.eql(null)
      prg(function (v) { 
        expect(v).to.eql(combinators.noop)
        done()
      })
    }) 
  })


})