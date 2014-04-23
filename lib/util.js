module.exports = {

  cps: function (f, self) { 
    return function () {
      var args = slicer(arguments)(0, -1)
      var cont = slicer(arguments)(-1)[0]
      cont.apply(self, [].concat(f.apply(self, args)))
    }
  },

  slicer: function (ary) {
    return function (from, to) {
      return Array.prototype.slice.apply(ary, [from, to])
    }
  }
  
}