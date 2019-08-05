const {
    NlpManager
} = require('node-nlp')
const processNlp = require('../src/process')

module.exports = async function(path) {
    const manager = new NlpManager()
    manager.load(path)
    return processNlp(manager)
}