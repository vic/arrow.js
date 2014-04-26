var expect = require('chai').expect

describe('Arrow', function () {

  var Arrow = require('../lib/arrow')  

  describe('.noop', function () {
    it('passes arguments to its callback', function (done) {
      expect(Arrow.noop).to.satisfy(Arrow.isArrow)
      Arrow.noop(1, 2, function (a, b) {
        expect(arguments).to.have.length(2)
        expect([a, b]).to.eql([1, 2])
        done()
      })
    })
  })

  describe('.lift', function () {
    it('converts a cps function into an Arrow', function (done){
      var cps = function (a, b, k) { k(a * b) }
      expect(cps).not.to.satisfy(Arrow.isArrow)

      var arrow = Arrow(cps)
      expect(arrow).to.satisfy(Arrow.isArrow)

      arrow(2, 3, function (n) { 
        expect(arguments).to.have.length(1)
        expect(n).to.equal(6)
        done()
      })
    })
  })

  describe('.pure', function () {
    it('converts a pure javascript function into cps arrow', function (done) {
      var pure = function (a, b) { return a * b } 
      var arrow = Arrow.pure(pure)
      expect(arrow).to.satisfy(Arrow.isArrow)
      arrow(3, 5, 7, function (n) {
        expect(arguments).to.have.length(1) 
        expect(n).to.equal(15)
        done()
      })
    }) 
  })

  describe('.chain', function () {
    it('chains a series of cps functions one after another', function (done) {
      var prod = function (a, b, k) { k(a*b) }
      var twice = function (a, k) { prod(2, a, k) }
      var pow  = function (a, k) { prod(a, a, k) }
      var plus = function (n) { return function (v, k) { k(n + v) } }
      var arrow = Arrow.chain(twice, pow, plus(5), plus(1))
      expect(arrow).to.satisfy(Arrow.isArrow)
      arrow(3, function (n) {
        expect(arguments).to.have.length(1)
        expect(n).to.equal(42)
        done()
      })
    })
  })

})