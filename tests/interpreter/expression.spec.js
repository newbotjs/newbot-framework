module.exports = function(user, assert) {
    return user
        .start()
        .spy('start', function() {
            assert.equal(this.variable('foo'), 1)
            assert.equal(this.userVariable('score'), 3)
        })
        .end()
}