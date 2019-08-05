const _ = require('lodash')

module.exports = function(session, settings) {
    return options = _.merge({
        output(str, next) {
            session.send(str)
            next()
        },
        data: {
            session,
            webview: (url, data = {}) => {
                const btoa = str => Buffer.from(str).toString('base64')
                const params = encodeURIComponent(btoa(JSON.stringify(data)))
                url += `?data=${params}&webview=true`
                if (!url.startsWith('http')) {
                    url = process.env.SERVER_URL + url
                }
                return url 
            }
        }
    }, settings.output)
}