
const isArray = require('lodash/isArray')
const uniq = require('lodash/uniq')
const get = require('lodash/get')
const clone = require('lodash/clone')

class ExtractIntents {
    constructor(converse, manager) {
        this.manager = manager
        this.cacheLang = {}
        this.cache = []
        this.languages = []
        this.converse = converse
    }

    async getIntents() {
        const intents = await this.converse.getAllIntents()
        for (let intent of intents) {
            const langs = get(intent, '_skill.lang._list')
            if (langs) {
                this.languages = [
                    ...this.languages,
                    ...langs.map(lang => lang.split('_')[0])
                ]
                this.languages = uniq(this.languages)
            }
            let [intentName, utterances] = intent.params
            if (isArray(utterances)) {
                utterances = {
                    en: utterances
                }
            }
            for (let lang in utterances) {
                if (lang[0] == '_') continue
                this.cacheLang[lang] = true
                for (let utterance of utterances[lang]) {
                    this.cache.push({
                        params: [lang, utterance, intentName],
                        converse: intent._skill
                    })
                }
            }
        }
    }

    translate() {
        const langFiles = this.languages
        let cacheClone = []
        
        for (let i = 0 ; i < this.cache.length ; i++) {
            let { params } = this.cache[i]
            
            if (params[1][0] != '#') {
                cacheClone.push(clone(params))
                continue
            }
            const translateAndMemorize = (instanceLang, langId, text) => {
                const translated = instanceLang.translate(text)
                cacheClone.push([langId, translated, this.cache[i].params[2]])
            }

            for (let lang of langFiles) {
                let langId = lang
                const text = params[1].substr(1)
                const instanceLang = this.cache[i].converse.lang
                const fullLang = langId + '_' + langId.toUpperCase()
                instanceLang.set(fullLang)
                const group = instanceLang.getGroup(text)
                if (group.length > 0) {
                    for (let gtext of group) {
                        translateAndMemorize(instanceLang, langId, gtext)
                    }
                }
                else {
                    translateAndMemorize(instanceLang, langId, text)
                }
            }
        }
        for (let lang of langFiles) {
            this.cacheLang[lang] = true
        }
        this.cache = cacheClone  
    }

    addDocuments() {
        for (let params of this.cache) {
            this.manager.addLanguage(params[0])
            this.manager.addDocument(...params)
        }
        return this.manager
    }
}

module.exports = ExtractIntents