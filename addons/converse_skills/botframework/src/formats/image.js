const builder = require('botbuilder')
const _ = require('lodash')

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
        if (session.source === 'website') {
            return {
                text,
                image: contentUrl
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