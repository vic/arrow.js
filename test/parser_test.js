var expect = require('chai').expect

describe('Parser', function () {

  var Parser = require('../lib/parser')
  var Arrow  = require('../lib/arrow')
  var ctx = {Arrow: Arrow}

  it('tries to resolve Arrow from context', function (done) {
    expect(function () { Parser('hello') }).to.throw(/Unknown word: Arrow/)
    done()
  })

  it('resolves a word from given context objects', function (done) {
    var p = Parser('hello', {hello: 'world'}, ctx)
    expect(p).to.equal('world')
    done()
  })

  describe('creates constant arrow for literal', function () {

    var undefined
    parseConstant('undefined', 'undefined', undefined)
    parseConstant('null', 'null', null)
    parseConstant('integers', '22', 22)
    parseConstant('floats', '12.34', 12.34)
    parseConstant('strings', '"hello"', "hello")


    function parseConstant (desc, code, constant) {
      it(desc, function (done) {
        var arrow = Parser(code, ctx)
        expect(arrow).to.satisfy(Arrow.isArrow)
        arrow(function (x) {
          expect(arguments).to.have.length(1)
          expect(x).to.eql(constant)
          done()
        })
      })
    }
  })

})