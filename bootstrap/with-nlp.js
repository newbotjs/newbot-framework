const { containerBootstrap } = require('@nlpjs/core')
const { Nlp } = require('@nlpjs/nlp')
const {BuiltinCompromise} = require('@nlpjs/builtin-compromise')
const processNlp = require('../src/nlp/native')
const Converse = require('../src/converse')
const browser = require('../src/utils/browser')

module.exports = (fs) => {
    Converse.nlpManager = async function(path, langs = []) {     
        const container = await containerBootstrap()
        container.use(new Nlp({ forceNER: true, container }))
        const manager = container.get('nlp')

        for (let lang of langs) {
            container.use(lang)
        }

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

        const builtin = new BuiltinCompromise()
        container.register('extract-builtin-??', builtin, true)
        
        return processNlp(manager)
    }
    return Converse
}