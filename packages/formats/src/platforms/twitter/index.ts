import { FormatInterface, Button, Card } from '../format.interface'
import { User } from '../../../../../types/user'
import { PlatformFormat } from '../platform'

export class TwitterFormat extends PlatformFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    async image(contentUrl: string, contentType: string) {
        return {
            text: this.text,
            attachment: {
                type: 'media'
            },
            _data: {
                url: contentUrl,
                size: await this.sizeFile(contentUrl),
                type: contentType,
                category: 'dm_image'
            }
        }
    }

    buttons(buttons: Array<Button>) {
        const buttonsClone = buttons.map((b: Button) => {
            b = this.mapButton(b)
            switch (b.type) {
                case 'url':
                case 'web_url':
                    return {
                        type: 'web_url',
                        url: b.url,
                        label: b.title
                    }
                case 'share':
                    if (!b.tweet) {
                        console.warn('Specify "tweet" property to use shared button on twitter platform')
                        return
                    }
                    let { url, text, via, hashtags } = b.tweet
                    if (text) {
                        text = `text=${text}`
                    }
                    if (url) {
                        url = `&url=${url}`
                    }
                    if (via) {
                        via = `&via=${via}`
                    }
                    if (hashtags) {
                        hashtags = `&hashtags=${hashtags.split(',')}`
                    }
                    return {
                        type: 'web_url',
                        url: `https://twitter.com/intent/tweet?${url}${via}${text}${hashtags}`,
                        label: b.title || this.getByLang({
                            fr_FR: 'Partager',
                            en_EN: 'Share'
                        })
                    }
            }
        })
        return {
            text: this.text,
            ctas: buttonsClone
        }
    }

    quickReplies(actions: Array<any>) {
        actions = actions.map(action => {
            if (typeof action == 'string') {
                return {
                    label: action
                }
            }
            action = this.toByLang(action)
            return {
                label: action.text,
                metadata: action.payload
            }
        })
        return {
            text: this.text,
            quick_reply: {
                type: 'options',
                options: actions
            }
        }
    }
}