const apiai = require('apiai')
const uuid = require('uuid')

module.exports = function (config, input, userId, nlp) {

    const app = apiai(config['api.ai'].token)

    return new Promise((resolve, reject) => {
        const request = app.textRequest(input, {
            sessionId: userId
        })
        request.on('response', resolve)
        request.on('error', reject)
        request.end()
    })

}