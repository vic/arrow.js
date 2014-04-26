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
      var pure = function (a, b) { 
        expect(arguments).to.have.length(3)
        return a * b 
      } 
      var arrow = Arrow.pure(pure)
      expect(arrow).to.satisfy(Arrow.isArrow)
      arrow(3, 5, 7, function (n) {
        expect(arguments).to.have.length(1) 
        expect(n).to.equal(15)
        done()
      })
    }) 

    it('passes multiple return values to arrow continuation', function (done){
      var pure = function (a, b) { 
        expect([a, b]).to.eql([44, 55])
        return [11, 22, 33] 
      }
      var arrow = Arrow.pure(pure)
      expect(arrow).to.satisfy(Arrow.isArrow)
      arrow(44, 55, function (x, y, z) {
        expect(arguments).to.have.length(3)
        expect([x, y, z]).to.eql([11, 22, 33])
        done()
      })
    })
  })


  describe('.chain', function () {
    it('chains a series of cps functions one after another', function (done) {
      var prod  = function (a, b, k) { k(a*b) }
      var twice = function (a, k) { prod(2, a, k) }
      var pow   = function (a, k) { prod(a, a, k) }
      var plus  = function (n) { return function (v, k) { k(n + v) } }
      var arrow = Arrow.chain(twice, pow, plus(5), plus(1))
      expect(arrow).to.satisfy(Arrow.isArrow)
      arrow(3, function (n) {
        expect(arguments).to.have.length(1)
        expect(n).to.equal(42)
        done()
      })
    })
  })

  describe('.pureN', function () {
    it('creates an arrow from a pure function taking no args', function (done) {
      var pure = function () {
        expect(arguments).to.have.length(0)
        return 42
      }

      var arrow = Arrow.pureN(pure)
      expect(arrow).to.satisfy(Arrow.isArrow)

      arrow(99, function (x, y) {
        expect(arguments).to.have.length(2)
        expect(x).to.equal(42) 
        expect(y).to.equal(99)
        done()
      })
    })

    it('creates an arrow from a pure function that takes only two args', function (done) {
      var pure = function (a, b) {
        expect(arguments).to.have.length(2)
        return a + b
      } 
      var arrow = Arrow.pureN(pure, 2)
      expect(arrow).to.satisfy(Arrow.isArrow)
      arrow(11, 22, 44, 55, function (x, y, z) {
        expect(arguments).to.have.length(3)
        expect([x, y, z]).to.eql([33, 44, 55])
        done()
      })
    })

    it('creates an arrow from a pure function that drops its return value', function (done){
      var executed
      var pure = function () {
        expect(arguments).to.have.length(0) 
        executed = true
      }
      var arrow = Arrow.pureN(pure, null, 1)

      expect(arrow).to.satisfy(Arrow.isArrow)
      arrow(99, function (x) {
        expect(executed).to.be.ok 
        expect(arguments).to.have.length(1)
        expect(x).to.equal(99)
        done()
      })
    })
  })

  describe('.value', function () {
    it('creates an arrow that yields a constant value', function (done) {
      var a = Arrow.value(42) 
      var b = Arrow.value(24)
      expect(a).to.satisfy(Arrow.isArrow)
      a(99, function (x, y) {
        expect(arguments).to.have.length(2)
        expect(x).to.equal(42)
        expect(y).to.equal(99)
        done()
      })
    })
  })

})