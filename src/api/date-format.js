const moment = require('moment')

const DateFormat = {
    $params: ['user'],
    $call(date, format, user) {
        let locale = user.getLang()
        if (locale) {
            locale = locale.split('_')[0]
        }
        moment.locale(locale)
        return moment(date).format(format)
    }
}
 
module.exports = DateFormat