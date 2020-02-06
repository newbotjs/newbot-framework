const fs = require('fs')

require('../src/transpiler/load')
const Converse = require('./with-nlp')(fs)
const ConverseTesting = require('../src/testing/converse-testing')

module.exports = { Converse, NewBot: Converse, ConverseTesting }