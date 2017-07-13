module.exports = function(user, assert, converse) {

    function createUser(input, avg) {
        const newUser = converse.createUser()
        return newUser
            .spy('start', function() {
                const [,output] = this.output()
                assert.equal(this.variable('avg'), avg)
                assert.equal(output, avg)
            })
            .start()
            .input(input)
            .end()
    }

    return createUser(1, 1) // 1 user, 1 input ; avg = 1 / 1
        .then(() => createUser(3, 2)) // 2 users, 3 input ; avg = (1+3) / 2
        .then(() => createUser(1, 5/3)) // 3 users, 1 input ; avg = (1+3+1) / 3 = 5/3
        .then(() => createUser(10, 15/4)) // 4 users, 10 input ; avg = (1+3+1+10) / 4 = 15/4
    
}