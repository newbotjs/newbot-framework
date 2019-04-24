module.exports = function (user, assert, converse) {

    converse.nlp('regexp', {
        departure(str) {
            const match = /[a-z ]+([A-Z][a-z]+)?/.exec(str)
            if (!match) return false
            return { city: match[1] }
        }
    })

    return user
        .prompt('i want to go', testing => {
            assert.equal(testing.output(0), 'What is your city?')
        })
        .end()
}