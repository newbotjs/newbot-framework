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
    }
}

module.exports = Array