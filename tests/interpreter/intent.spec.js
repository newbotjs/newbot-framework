module.exports = function (user, assert, converse) {

    converse.nlp('regexp', {
        departure(str) {
            const match = /[a-z ]+([A-Z][a-z]+)?/.exec(str)
            if (!match) return false
            return { city: match[1] }
        },
        confirm(str) {

        }
    })

    converse.useNlp('regexp')

    return user
        .start()
        .input('i want to go', function () {
            const output = this.output()
            console.log(output)
            assert.equal(output, 'What is your city?')
        })
        .end()
}