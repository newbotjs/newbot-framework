const {
    NlpManager
} = require('node-nlp')
const processNlp = require('./src/nlp/native')

require('./src/transpiler/load')

const Converse = require('./src/converse')

Converse.nlpManager = async function(path) {
    const manager = new NlpManager()
    manager.load(path)
    return processNlp(manager)
}

const ConverseTesting = require('./src/testing/converse-testing')

module.exports = { Converse, NewBot: Converse, ConverseTesting }