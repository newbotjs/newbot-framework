const builder = require('botbuilder')

const lib = new builder.Library('ConverseScript')

module.exports = (converse) => {
    lib.dialog('exec', (session) => {
    const { text, user } = session.message
    converse.exec(text, user.id, {
            output(output, done) {
                session.send(output)
                done()
            },
            data: {
                session
            }
        })
    })
    return lib
}
