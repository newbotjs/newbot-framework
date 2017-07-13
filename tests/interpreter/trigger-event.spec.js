module.exports = function (user, assert, converse) {
    return user
        .event('broadcast', function () {
            const [output] = this.output()
            assert.equal(output, 'ok')
        })
        .end()
}