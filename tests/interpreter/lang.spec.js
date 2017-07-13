module.exports = function (user, assert, converse) {

    converse.format('quick', function (text, [responses]) {
        return {
            type: 'quick',
            responses,
            text
        }
    })

    return user
        .start()
        .end()
}