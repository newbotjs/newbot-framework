module.exports = function(user, assert) {
    return user
        .start(function() {
            const [output] = this.output()
            assert.equal(output, 'what your language ?')
            assert.equal(this.variable('myvar'), 1)
        })
        .input('fr', function() {
            assert.deepEqual(this.output(), ['thanks', 'your name ?'])
            assert.equal(this.variable('myvar'), 2)
        })
        .end()
}