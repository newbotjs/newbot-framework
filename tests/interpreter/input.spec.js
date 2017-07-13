module.exports = function (user, assert) {
    return user
        .start(function () {
            const [output] = this.output()
            assert.equal(output, 'your name')
        })
        .input('sam', function () {
            const [output] = this.output()
            assert.equal(output, 'hello sam')
            assert.equal(this.magicVariable('text'), 'sam')
        })
        .end()
}