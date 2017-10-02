module.exports = function (user, assert, converse) {

    converse.configure({
        languages: {
            path: __dirname + '/../languages',
            packages: ['en_EN', 'fr_FR']
        }
    }).loadLanguage()

    converse.format('quick', function (text, [responses]) {
        return {
            type: 'quick',
            responses,
            text
        }
    })

    return user
        .start()
        .prompt('Français', testing => {
            assert.equal(testing.output(0), 'Salut')
            assert.equal(testing.output(1), 'Your language : Français')
        })
        .end()
}