module.exports = function(user, assert, converse) {
    return user
        .start(function() {
            assert.deepEqual(this.output(), [ '0' ])
            assert.equal(this.variable('val'), 0)
        })
        .spy('start', function() {
            assert.equal(this.variable('val'), 3)
        })
        .input('one', function() {
            assert.deepEqual(this.output(), [ '1' ])
            assert.equal(this.variable('val'), 1)
        })
        .input('two', function() {
           assert.deepEqual(this.output(), [ '2' ])
           assert.equal(this.variable('val'), 2)
        })
        .input('three', testing => {
           assert.equal(testing.variable('val'), 3)
        })
        .end()
}
