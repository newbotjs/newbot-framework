const _ = require('lodash')

const Array = {

    length(array) {
        return array.length
    },

    push(array, value) {
        return array.push(value)
    },

    remove: _.remove,

    find: _.find,

    sortBy: _.sortBy,

    filter: _.filter

}

module.exports = Array