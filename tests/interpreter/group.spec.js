module.exports = function (user, assert) {
    return user
        .start(testing => {
            assert.ok(['hello', 'hey'].indexOf(testing.output(0)) !== -1)
        })
        .end()
}