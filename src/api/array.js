const _ = require('lodash')

const Array = {

    length(array) {
        return array.length
    },

    push(array, value) {
        return array.push(value)
    },

    pushOnlyUniq(array, value) {
        if  (array.indexOf(value) === -1) {
            return this.push(array, value)
        }
        return array
    },

    remove: _.remove,

    find: _.find,

    sortBy: _.sortBy,

    filter: _.filter

}

module.exports = Array