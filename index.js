const Converse = require('./src/converse')
const ConverseTesting = require('./src/testing/converse-testing')

const peg = require('pegjs')
const grammar = require('./src/transpiler/grammar')
global.parser = peg.generate(grammar)

module.exports = { Converse, NewBot: Converse, ConverseTesting }



