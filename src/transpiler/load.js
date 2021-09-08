const peg = require('pegjs')
const grammar = require('./grammar')
const Transpiler = require('./lexer')
const parser = peg.generate(grammar)

Transpiler.newbotParser = parser
