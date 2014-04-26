var expect = require('chai').expect

describe('Parser', function () {

  var Parser = require('../lib/parser')
  var Arrow  = require('../lib/arrow')

  it('tries to resolve an Arrow context', function (done) {
    expect(function () { Parser('hello') }).to.throw(/Unknown word: Arrow/)
    done()
  })

  it('resolves a word on given context objects', function (done) {
    var p = Parser('hello', {hello: 'world', Arrow: Arrow})
    expect(p).to.equal('world')
    done()
  })

})