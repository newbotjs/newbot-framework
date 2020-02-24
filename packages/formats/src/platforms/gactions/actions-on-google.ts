import { FormatInterface, Button, Card } from '../format.interface'
import { User } from '../../../../../types/user'
import { PlatformFormat } from '../platform'

export class ActionsOnGoogleFormat extends PlatformFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    image(contentUrl: string) {
        return [
            this.text,
            {
                method: 'Image',
                params: [{
                    url: contentUrl,
                    alt: this.text
                }]
            }
        ]
    }

    video(contentUrl: string) {
        return [
            this.text,
            {
                method: 'BasicCard',
                params: [{
                    text: name,
                    buttons: {
                        title: this.getByLang({
                            fr_FR: 'Voir la vidéo',
                            en_EN: 'View video'
                        }),
                        url: contentUrl
                    }
                }]
            }
        ]
    }

    buttons(buttons: Array<Button>) {
        return [
            this.text,
            ...buttons.map((b: Button) => {
                let method, param
                switch (b.type) {
                    case 'postback':
                        method = 'Suggestions'
                        param = b.msg || b.title
                        break
                    case 'url':
                    case 'web_url':
                        method = 'LinkOutSuggestion'
                        param = {
                            name: b.title,
                            url: b.url
                        }
                        break
                }
                return {
                    method,
                    params: [param]
                }
            })
        ]
    }

    quickReplies(actions: Array<any>) {
        return [this.text, {
            method: 'Suggestions',
            params: this.inlineQuickReplies(actions)
        }]
    }

    signin() {
        return [
            {
                method: 'SignIn',
                params: [this.text]
            }
        ]
    }
}