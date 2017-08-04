module.exports = function(user, assert, converse) {
    return user
        .start()
        .spy('start', function() {
            assert.equal(this.variable('opposite1'), false)
            assert.equal(this.variable('bool2'), false)
            assert.equal(this.variable('bool3'), true)
            assert.equal(this.variable('bool4'), false)
            assert.equal(this.variable('val'), 2, 'first value')
        })
        .input('noop1', function() {
            assert.deepEqual(this.output(), [ 'a', 'b' ])
            assert.equal(this.variable('val'), 1, 'first value')
        })
        .input('noop2', function() {
            assert.deepEqual(this.output(), [ 'noop2', 'c', 'd' ])
            assert.equal(this.variable('val'), 2, 'second value')
        })
        .input('ok', function() {
            assert.deepEqual(this.output(), [ 'e' ])
        })
        .end()
}
