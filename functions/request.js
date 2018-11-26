const _ = require('../src/utils/lodash')
const request = require('axios')

const Request = {
   
    $params: ['user'],

    $call(options, user) {
        return new Promise((resolve, reject) => {
            if (_.isString(options)) {
                options = {
                    method: 'get',
                    url: options
                }
            }
            request(options).then((response) => {
                const ret = {
                    data: response.data,
                    headers: response.headers,
                    statusCode: response.status
                }
                user.setMagicVariable('response', ret)
                resolve(ret)
            })
        })
    },

    $mock(ret, user) {
        user.setMagicVariable('response', ret)
        return ret
    }
}


module.exports = Request