module.exports = function (user, assert, converse) {

    converse.format('button', function (text, [number]) {
        return {
            type: 'button',
            number,
            text
        }
    })

    return user
        .start()
        .spy('start', function () {
            const [output] = this.output()
            assert.deepEqual(output, {
                type: 'button',
                number: 42,
                text: 'ok'
            })
        })
        .end()
}