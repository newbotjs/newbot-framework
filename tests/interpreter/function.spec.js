module.exports = function(user, assert) {
    return user
        .start(testing => {
            assert.equal(testing.output(0), 'test')
            assert.equal(testing.output(1), 'hello')
        })
        .prompt('test', testing => {
            assert.equal(testing.output(0), '3')
        })
        .end()
}