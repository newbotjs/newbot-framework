const LANGS_ID = ['fr_FR', 'en_EN']

class Utils {
    isFacebook(session) {
        return session.message.source === 'facebook'
    }

    isBotBuilder(session) {
        return session.message.agent === 'botbuilder'
    }

    isBotBuilderFacebook(session) {
        return this.isFacebook(session) && this.isBotBuilder(session)
    }

    isWebSite(session) {
        return session.message.source === 'website'
    }

    getByLang(prop, user) {
        const lang = user.getLang()
        if (prop && lang) {
            if (prop[lang]) {
                return prop[lang]
            }
            else if (prop[this.defaultLanguage]) {
                return prop[this.defaultLanguage]
            }
            else {
                const [lang] = Object.keys(prop)
                if (LANGS_ID.indexOf(lang) != -1) {
                    return prop[lang]
                }
            }
        }
        return prop
    }

    toByLang(obj, user) {
        for (let prop in obj) {
            obj[prop] = this.getByLang(obj[prop], user)
        }
        return obj
    }
}

module.exports = new Utils()