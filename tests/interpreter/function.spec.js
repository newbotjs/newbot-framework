module.exports = function(user, assert) {
    return user
        .start()
        .spy('start', function() {
            const [output] = this.output()
            assert.equal(output, 'test')
        })
        .end()
}