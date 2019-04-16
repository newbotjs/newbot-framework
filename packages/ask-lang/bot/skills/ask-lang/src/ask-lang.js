import formats from 'newbot-formats'
import languages from './languages'
import code from './ask-lang.converse'

const getInstanceLang = (fn) => {
    const { execution } = fn.converse
    return execution.converse.lang
}

export default {
    code,
    skills: {
        formats
    },
    functions: {
        _transformTo(langs) {
            const langInstance = getInstanceLang(this)
            const { user } = this.converse
            const currentlang = user.getLang()
            return langs.map(lang => {
                if (currentlang) return langInstance.translate(lang, currentlang)
                return langInstance.translate(lang)
            })
        },
        set(text) {
            const { user } = this.converse
            const langInstance = getInstanceLang(this)
            const group = langInstance.getGroup('lang')
            let langFounded
            for (let langCode of group) {
                const valueCode = langInstance.translate(langCode)
                if (text.toLowerCase().includes(valueCode.toLowerCase())) {
                    langFounded = langCode
                    break
                }
            }
            if (langFounded) {
                user.setLang(langFounded)
            }
            return langFounded
        },
        currentName() {
            const { user } = this.converse
            const langInstance = getInstanceLang(this)
            const lang = user.getLang()
            return langInstance.translate(lang, lang) 
        }
    },
    languages
}