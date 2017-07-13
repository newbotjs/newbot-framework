module.exports = function(user, assert) {
    return user
        .start()
        .spy('start', function() {
            assert.equal(this.variable('calc'), 6)
            const other = this.variable('other')
            assert.equal(other.four, 4)
            assert.deepEqual(this.variable('array'), [1, 4, 3])
            assert.equal(this.variable('arraySum'), 4)
            assert.equal(this.variable('two'), 2)
            assert.equal(this.variable('four'), 4)
            const value = this.variable('value')
            assert.equal(value.more.last, 1338)
        })
        .end()
}