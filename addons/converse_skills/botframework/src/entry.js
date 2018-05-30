const formats  = require('./formats')
const { isWebSite } = require('./utils')

module.exports = (converse) => {
    for (let key in formats) {
        let format = formats[key]
        format(converse)
    }
    converse.functions({
        Typing: {
            $params: ['data'],
            $call({ session }) {
                if (!isWebSite(session)) {
                    session.sendTyping()
                }  
            }
        }
    })
}