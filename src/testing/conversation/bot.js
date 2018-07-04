module.exports = function(str) {
    return {
        type: 'bot',
        str: str.raw ? str.raw[0] : str
    }
}