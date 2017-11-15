const builder = require('botbuilder')
const { isFacebook } = require('../utils')
const _ = require('lodash')
const querystring = require('querystring')

module.exports = (converse) => {
    converse.format('quickReplies', (text, [actions], { session }) => {
        if (isFacebook(session)) {
            actions = actions.map(action => {
                if (_.isString(action)) {
                    return {
                        content_type: 'text',
                        title: action,
                        payload: action
                    }
                }
                if (!action.type) action.type = 'text'
                if (action.action) {
                    action.payload = `action?${querystring.stringify(action.action)}`
                }
                return {
                    content_type: action.type,
                    title: action.text,
                    payload: action.payload,
                    image_url: action.image
                }
            })
            return new builder.Message(session)
                .sourceEvent({
                    facebook: {
                        text,
                        quick_replies: actions
                    }
                })
        }
        actions = actions.map(action => {
            return builder.CardAction.imBack(session, action, action)
        })
        return new builder.Message(session)
            .text(text)
            .suggestedActions(builder.SuggestedActions.create(session, actions))
    })
    return converse
}