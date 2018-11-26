const Request = require('../../functions/request')

module.exports = function(user, assert, converse) {

    converse.functions({
        Request
    })

    converse.mock('Request', function(url) {
        return {
            statusCode: 200
        }
    })

    return user
        .start()
        .spy('start', function() {
            assert.deepEqual(this.output(), ['get', 'thanks'])
            const { statusCode } = this.magicVariable('response')
            assert.equal(statusCode, 200)
        })
        .end()
}