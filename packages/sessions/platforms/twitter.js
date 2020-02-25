const crypto = require('crypto')
const _ = require('lodash')
const rp = require('request-promise')

const uri = 'https://api.twitter.com/1.1'
const uriUpload = 'https://upload.twitter.com/1.1'

class TwitterSession {
    constructor(config, body) {
        this.oauth = {
            consumer_key: config.consumerKey,
            consumer_secret: config.consumerSecret,
            token: config.accessToken,
            token_secret: config.accessTokenSecret
        }
        this.appId = config.accessToken.split('-')[0]
        this.body = body
        this.platform = 'twitter'
        this._parse()
    }

    async send(messageData) {
        if (_.isString(messageData)) {
            messageData = {
                text: messageData
            }
        }
        if (messageData.attachment) {
            const {
                size,
                type,
                category,
                url
            } = messageData._data
            const {
                media_id: mediaId
            } = await rp.post({
                url: `${uriUpload}/media/upload.json?command=INIT&total_bytes=${size}&media_types=${type}&media_category=${category}`,
                oauth: this.oauth,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                }
            })

            const contentData = await rp({
                url,
                encoding: 'binary'
            })

            const ret = await rp.post({
                url: `${uriUpload}/media/upload.json?command=APPEND&media_id=${mediaId}&media=${contentData}&segment_index=0`,
                oauth: this.oauth
            })

            console.log(ret)
        }
        return await rp.post({
            url: `${uri}/direct_messages/events/new.json`,
            oauth: this.oauth,
            headers: {
                'content-type': 'application/json'
            },
            json: true,
            body: {
                event: {
                    type: 'message_create',
                    message_create: {
                        target: {
                            recipient_id: this.userId
                        },
                        message_data: messageData
                    }
                }
            }
        })
    }

    _parse() {

        console.log(JSON.stringify(this.body, null, 2))

        const {
            direct_message_events: dms
        } = this.body

        if (!dms) {
            return
        }

        for (let dm of dms) {
            const {
                message_create: message
            } = dm
            const {
                message_data: messageData,
                sender_id: userId
            } = message

            if (this.appId == userId) continue

            this.text = messageData.text
            this.userId = userId
        }
    }

    get message() {
        return {
            source: this.platform,
            agent: this.platform
        }
    }

    get source() {
        return this.message.source
    }
}

const CRCToken = function (config, {
    crc_token: crcToken
}) {
    if (crcToken) {
        const hash = crypto.createHmac('sha256', config.consumerSecret).update(crcToken).digest('base64')
        return {
            response_token: 'sha256=' + hash
        }
    } else {
        throw new Error('Error: crc_token missing from request.')
    }
}

module.exports = {
    TwitterSession,
    CRCToken
}
