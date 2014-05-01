var expect = require('chai').expect

describe('Combinators', function () {

  var _ = require('../lib/combinators')

  describe('k', function () {
    it('discards second item on stack and executes first', function (done) {
      var a = function (x, y, k) { k( x + y ) }
      _.k(a, 3, 5, 7, function (w) {
        expect(w).to.equal(12) 
        expect(arguments).to.have.length(1)
        done()
      })
    })
  })

  describe('cake', function () {
    it('replaces top two elements on stack with combinators', function (done) {
      _.cake(1, 2, 3, 4, function (a, b, c, d) {
        expect(arguments).to.have.length(4) 
        expect(typeof a == 'function')
        expect(typeof b == 'function')
        expect(c).to.equal(3)
        expect(d).to.equal(4)
        done()
      })
    })

    describe('top stack combinator', function () {
      it('executes A then leaves B as top of stack', function (done) {
        var A = function (x, y, k) { k(x + y) }
        _.cake(A, 2, function (x, y) {
          x(3, 4, function (b, c) {
            expect(c).to.equal(7) 
            expect(b).to.equal(2)
            expect(arguments).to.have.length(2)
            done()
          })
        })
      })
    })

    describe('second stack combinator', function () {
      it('executes A having B as second element on stack', function (done) {
        var A = function (x, y, z, k) { k(x + y, z) }
        _.cake(A, 2, function (x, y) {
          y(3, 4, function (b, c) {
            expect(arguments).to.have.length(2)
            expect(c).to.equal(4) 
            expect(b).to.equal(5)
            done()
          })
        })        
      })
    })
  })

  describe('dip', function () {
    it('executes A and leaves B on top', function (done) {
      var a = function (x, y, k) { k(x+y) }
      _.dip(a, 5, 3, 4, function (B, z) {
         expect(arguments).to.have.length(2)
         expect(B).to.equal(5)
         expect(z).to.equal(7)
         done() 
      })
    }) 
  })
  
  describe('i', function () {
    it('executes the stack top', function (done) {
      var a = function (x, k) { k(x * x) } 
      _.i(a, 2, function (z) {
        expect(z).to.equal(4) 
        expect(arguments).to.have.length(1)
        done()
      })
    })
  })

})