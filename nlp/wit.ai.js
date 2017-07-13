const { Wit, log } = require('node-wit')

module.exports = function (config, input, nlp) {
    const client = new Wit({ accessToken: config['wit.ai'].token })
    return client.message(input).catch(err => console.log(err))
}