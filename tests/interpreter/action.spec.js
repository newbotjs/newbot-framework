module.exports = function (user, assert, converse) {
    return user
        .action('buy', '1337', function () {
            assert.deepEqual(this.output(), [
                'transaction : 1337'
            ])
        })
        .end()
}