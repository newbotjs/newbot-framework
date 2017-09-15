module.exports = function(user, assert) {
    return user
        .start()
        .spy('start', testing => {
            assert.equal(testing.output(0), 'test')
            assert.equal(testing.output(1), 'hello')
            //assert.equal(testing.output(2), '3')
        })
        .end()
}