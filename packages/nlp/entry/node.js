const {
    NlpManager
} = require('node-nlp')
import processNlp from '../src/process'

export default async function(path) {
    const manager = new NlpManager()
    manager.load(path)
    return processNlp(manager)
}