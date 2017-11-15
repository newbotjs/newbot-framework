const builder = require('botbuilder')

module.exports = (converse) => {
    converse.format('image', (text, [contentUrl, contentType, name], { session }) => {
        if (!name) {
            name = _.last(contentUrl.split('/'))
        }
        if (!contentType) {
            let ext = _.last(name.split('.'))
            ext = ext.toLowerCase()
            if (['gif', 'png', 'jpeg', 'jpg'].indexOf(ext)) {
                contentType = 'image/' + ext
            }
        }
        return new builder.Message(session)
            .text(text)
            .addAttachment({
                contentUrl,
                contentType,
                name
            })
    })
}