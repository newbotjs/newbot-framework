module.exports = function (user, assert, converse) {
    return user
        .start()
        .spy('start', function (testing) {
            assert.equal(testing.output(0), ['2'])
            assert.equal(testing.output(1), ['ok'])
        })
        .end()
}