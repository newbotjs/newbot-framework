class Async {
    async map(array, cb) {
        for (let i = 0 ; i < array.length ; i++) {
            array[i] = await cb(array[i])
        }
        return array
    }
}

module.exports = new Async()