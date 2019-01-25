
const { NlpManager } = require('node-nlp')

module.exports = {
    async loadModel(converse, path) {
        const manager = new NlpManager()
        manager.load(path)
        converse._manager = manager
    }
}