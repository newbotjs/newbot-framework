const LANG_NAMES = {
    fr_FR: ['Français', 'French'],
    en_EN: ['English', 'English']
}

const Lang = {
   
    $params: ['user'],

    set(lang, user) {
        if (lang) {
            user.setLang(lang)
        }
    },

    name(user) {
        const lang = user.getLang()
        return LANG_NAMES[lang][0]
    }
}


module.exports = Lang