import Converse from './src/converse'
import processNlp from './src/nlp/native'

Converse.nlpManager = async function(path) {
    const manager = new window.NLPJS.NlpManager()
    const model = await fetch(path).then(res => res.json())
    manager.import(model)
    return processNlp(manager)
}

window.Converse = Converse
window.NewBot = Converse
