module.exports = function(user, assert) {
    return user
        .start(function() {
            assert.equal(this.userVariable('score'), 1)
        })
        .input('sam', function() {
            const [output] = this.output()
            assert.equal(output, 'your score 4')
            assert.equal(this.userVariable('score'), 4)
        })
        .end()
}