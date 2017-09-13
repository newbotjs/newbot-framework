module.exports = function (user, assert, converse) {
    return user
        .event('broadcast', function () {
            const output = this.output()
            assert.equal(output.length, 1)
            assert.equal(output[0], 'ok')
        })
        .end()
}