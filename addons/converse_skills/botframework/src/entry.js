const formats  = require('./formats')

module.exports = (converse) => {
    for (let key in formats) {
        let format = formats[key]
        format(converse)
    }
    converse.functions({
        Typing: {
            $params: ['data'],
            $call({ session }) {
                session.sendTyping()
            }
        }
    })
}