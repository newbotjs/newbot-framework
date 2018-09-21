const request = require('request')

const Request = {
   
    $params: ['user'],

    $call(url, user) {
        return new Promise((resolve, reject) => {
            console.log(url)
            request(url, (error, response, body) => {
                if (/json/.test(response.headers['content-type'])) {
                    body = JSON.parse(body)
                }
                const ret = {
                    data: body,
                    headers: response.headers,
                    statusCode: response.statusCode
                }
                user.setMagicVariable('response', ret)
                resolve(ret)
            });
        })
    },

    $mock(ret, user) {
        user.setMagicVariable('response', ret)
        return ret
    }
}


module.exports = Request