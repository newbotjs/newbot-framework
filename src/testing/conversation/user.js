module.exports = function(str) {
    return {
        type: 'user',
        str: str.raw ? str.raw[0] : str
    }
}