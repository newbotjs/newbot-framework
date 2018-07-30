const Utils = require('./src/utils')
const formats  = require('./src/formats')

module.exports = (langDefault) => {

    Utils.defaultLanguage = langDefault

    return {
        shareFormats: true,
        formats,
        functions: {
            Typing: {
                $params: ['data'],
                $call({ session }) {
                    if (!Utils.isWebSite(session)) {
                        session.sendTyping()
                    }  
                }
            }
        }
    }
}