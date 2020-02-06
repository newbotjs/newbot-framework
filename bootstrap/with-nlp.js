const { containerBootstrap } = require('@nlpjs/core')
const { Nlp } = require('@nlpjs/nlp')
const processNlp = require('../src/nlp/native')
const Converse = require('../src/converse')
const browser = require('../src/utils/browser')

module.exports = (fs) => {
    Converse.nlpManager = async function(path, langs = []) {
        const container = await containerBootstrap()
        container.use(Nlp);
        for (let lang of langs) {
            container.use(lang)
        }
        const manager = container.get('nlp')
        if (path[0] == '{') {
            manager.import(path)
        }
        else if (browser.is()) {
            const model = await fetch(path).then(res => res.json())
            manager.import(model)
        }
        else {
            const model = fs.readFileSync(path, 'utf-8')
            manager.import(model)
        }
        return processNlp(manager)
    }
    return Converse
}