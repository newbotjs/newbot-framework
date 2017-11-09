const Utils = {
    uniqid() {
        return new Date().valueOf().toString(36) + Math.random().toString(36).substr(2)
    }
}

module.exports = Utils