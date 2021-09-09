const ExtractIntents = require('./extract')
const { containerBootstrap } = require('@nlpjs/core')
const { Nlp } = require('@nlpjs/nlp')
const { BuiltinCompromise } = require('@nlpjs/builtin-compromise')

module.exports = {
    async train(converse, langs = []) {
        const container = await containerBootstrap()
        container.use(Nlp)
  
        for (let lang of langs) {
            container.use(lang)
        }

        const builtin = new BuiltinCompromise()
        container.register('extract-builtin-??', builtin, true)
        
        const nlp = container.get('nlp')
        nlp.settings.autoSave = false
    
        const extract = new ExtractIntents(converse, nlp)
        await extract.getIntents()
        extract.translate()
        const manager = extract.addDocuments()
        await manager.train()
        return manager.export(true)
    }
}