module.exports = function (user, assert, converse) {

    converse.nlp('regexp', {
        'input.departure'(str) {
            return /cherche/.test(str) ? { search: true } : null
        }
    })

    converse.useNlp('regexp')

    return user
        .start()
        .input('je cherche une maison')
        .spy('search', function () {
            const [output] = this.output()
            assert.equal(output, 'search')
        })
        .end()
}