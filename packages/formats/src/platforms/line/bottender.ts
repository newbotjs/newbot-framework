import { FormatInterface, Button, Card } from '../format.interface'
import { User } from '../../../../../types/user'
import { PlatformFormat } from '../platform'
import querystring from 'querystring'

export class LineBottenderFormat extends PlatformFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    image(contentUrl: string): any {
        return {
            method: 'replyImage',
            params: [contentUrl]
        }
    }

    video(contentUrl: string): any {
        return {
            method: 'replyVideo',
            params: [contentUrl]
        }
    }

    location(latitude: number, longitude: number, {
        title = '',
        address = ''
    } = {}) {
        return [
            this.text,
            {
                method: 'replyLocation',
                params: [{
                    title,
                    address,
                    latitude,
                    longitude
                }]
            }
        ]
    }

    protected card(card:Card) {
        const cardClone: any = {
            thumbnailImageUrl: card.image,
            title: card.title,
            text: card.subtitle
        }
        if (card.buttons) {
            cardClone.actions = this.buttons(card.buttons)
        }
        return cardClone
    }

    carousel(cards: Array<Card>) {
        return {
            method: 'replyCarouselTemplate',
            params: [
                this.text, 
                cards.map((card:Card) => this.card(card))
            ]
        }
    }

    buttons(buttons: Array<Button>) {
        const buttonsClone = buttons
            .filter(b => b)
            .map(b => {
                b = this.mapButton(b)
                switch (b.type) {
                    case 'url':
                    case 'web_url':
                        return {
                            type: 'uri',
                            uri: b.url,
                            label: b.title
                        }
                    case 'postback':
                        return {
                            type: 'postback',
                            label: b.title,
                            data: b.msg || b.title
                        }
                    default:
                        break;
                }
            })
        return buttonsClone
    }

    quickReplies(actions: Array<any>) {
        actions = actions.map(action => {
            if (typeof action == 'string') {
                return {
                    type: 'action',
                    action: {
                        type: 'message',
                        label: action
                    }
                }
            }
            action = this.toByLang(action)
            if (!action.type) action.type = 'message'
            if (action.action) {
                action.payload = `action?${querystring.stringify(action.action)}`
            }
            return {
                type: 'action',
                action: {
                    type: action.type,
                    label: action.text,
                    text: action.payload
                }
            }
        })
        return {
            method: 'replyText',
            params: [
                this.text,
                {
                    items: actions
                }
            ]
        }
    }

}