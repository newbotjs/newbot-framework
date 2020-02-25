import querystring from 'querystring'
import truncate from 'lodash.truncate'
import obj from 'messaging-api-messenger/lib/Messenger'
import { FormatInterface, Button, Card } from '../format.interface'
import { PlatformFormat } from '../platform'
import { User } from '../../../../../types/user'

export class MessengerFormat extends PlatformFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    video(contentUrl: string) {
        return this.attachment('video', {
            url: contentUrl
        })
    }

    image(contentUrl: string) {
        return this.attachment('image', {
            url: contentUrl
        })   
    }

    email() {
        return this.quickReplies([{
            type: 'user_email'
        }])
    }

    phone() {
        return this.quickReplies([{
            type: 'user_phone_number'
        }])
    }

    quickReplies(actions: Array<any>): { text: string, quick_replies: any } {
        return obj.createMessage(this.text, {
            quick_replies: this.actions(actions)
        })
    }

    buttons(buttons: Array<Button>): any {
        const buttonsClone = buttons
            .filter(b => b)
            .map((b: Button) => {
                b = this.mapButton(b)
                switch (b.type) {
                    case 'url':
                    case 'web_url':
                        return {
                            type: "web_url",
                            url: b.url,
                            title: b.title
                        }
                    case 'share':
                        return {
                            type: 'element_share'
                        }
                    case 'postback':
                        return {
                            type: 'postback',
                            title: b.title,
                            payload: b.msg || b.title
                        }
                    case 'webview':
                        return {
                            type: "web_url",
                            url: b.url,
                            title: b.title,
                            webview_height_ratio: b.height || 'full',
                            messenger_extensions: true
                        }
                    case 'phone':
                        return {
                            type: 'phone_number',
                            title: b.title,
                            payload: b.phone_number
                        }
                    case 'account_link':
                        return {
                            type: 'account_link',
                            url: b.url
                        }
                    default:
                        return b
                }
            })
        return this.attachment('template', {
            template_type: 'button',
            text: this.text,
            buttons: buttonsClone
        })          
    }

    carousel(cards: Array<Card>) {
        return this.attachment('template', {
            template_type: "generic",
            elements: cards.map((card: Card) => this.card(card))
        })
    }

    contact(phone: string, name: string) {
        return this.buttons([
            {
                type: 'phone',
                title: 'Call ' + name,
                phone_number: phone
            }
        ])
    }

    signin(url: string) {
        return this.buttons([
            {
                type: 'account_link',
                url
            } 
        ])
    }
    
    protected card(card: Card): any {
        card = super.card(card)
        card.buttons = this.buttons(card.buttons).attachment.payload.buttons
        return {
            title: truncate(card.title || '(empty)', {
                length: 75,
            }),
            subtitle: truncate(card.subtitle, {
                length: 75,
            }),
            image_url: card.image,
            buttons: card.buttons
        }
    }

    protected actions(actions: Array<any>) {
        return actions.map(action => {
            if (typeof action == 'string') {
                return {
                    content_type: 'text',
                    title: action,
                    payload: action
                }
            }
            action = this.toByLang(action)
            if (!action.type) action.type = 'text'
            if (action.action) {
                action.payload = `action?${querystring.stringify(action.action)}`
            }
            if (!action.payload) {
                action.payload = action.text
            }
            return {
                content_type: action.type,
                title: action.text,
                payload: action.payload,
                image_url: action.image
            }
        })
    }

    private attachment(type: string, payload: any) {
        return {
            attachment: {
                type,
                payload
            }
        }
    }
} 
