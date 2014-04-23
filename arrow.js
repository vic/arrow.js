var parser = require('./lib/parser')
var core = require('./lib/core')

var arr = parser('"hello" inspect', core) 

arr()