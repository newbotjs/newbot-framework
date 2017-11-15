module.exports = {
    isFacebook(session) {
        return session.message.source === 'facebook'
    }
}