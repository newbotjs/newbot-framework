class Utils {
    isFacebook(session) {
        return session.message.source === 'facebook'
    }
    getByLang(prop, user) {
        const lang = user.getLang()
        if (prop && lang && prop[lang]) {
            return prop[lang]
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