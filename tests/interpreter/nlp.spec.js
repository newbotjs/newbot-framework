module.exports = function (user, assert, converse) {

    converse.nlp('regexp', {
        'input.departure'(str) {
            return /cherche/.test(str) ? { search: true } : null
        }
    }, { priority: 1 })

    converse.nlp('other-regexp', {
        hey(str) {
            return /hey/.test(str)
        }
    }, { priority: 0 })

    return user
        .start()
        .input('je cherche une maison')
        .spy('search', function () {
            const [output] = this.output()
            assert.equal(output, 'search')
        })
        .end()
}