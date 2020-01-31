require('../src/transpiler/load')
require('./with-nlp')

const Converse = require('../src/converse')
const ConverseTesting = require('../src/testing/converse-testing')

module.exports = { Converse, NewBot: Converse, ConverseTesting }