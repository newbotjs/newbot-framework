module.exports = function(user, assert, converse) {

    converse.configure({
        languages: {
            path:  __dirname + '/../languages',
            packages: ['en_EN'] 
        }
    }).load()

    return user
        .start()
        .spy('start', function() {
            const output = this.output()
            assert.equal(output[0], 'Hello world')
            assert.equal(output[1], 'You have 5 messages')
            assert.equal(output[2], 'You have 3 messages')
        })
        .end()
}