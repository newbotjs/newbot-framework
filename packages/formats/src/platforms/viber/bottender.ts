import { FormatInterface, Button, Card } from '../format.interface'
import { User } from '../../../../../types/user'
import { PlatformFormat } from '../platform'
import flatten from 'lodash/flatten'

export class ViberBottenderFormat extends PlatformFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    image(contentUrl: string, contentType: string, name: string, thumbnail: string): any {
        return {
            method: 'sendPicture',
            params: [{
                text: this.text,
                media: contentUrl,
                thumbnail
            }]
        }
    }

    async video(contentUrl: string, contentType: string, name: string, {
        thumbnail = '',
        duration = '',
        size = ''
    } = {}) {
        const sizeFile = await this.sizeFile(contentUrl)
        return [
            this.text,
            {
                method: 'sendVideo',
                params: [{
                    media: contentUrl,
                    thumbnail,
                    duration,
                    size: size || sizeFile
                }]
            }
        ]
    }

    carousel(cards: Array<Card>) {
        return {
            method: 'sendCarouselContent',
            params: [{
                Type: 'rich_media',
                ButtonsGroupColumns: 6,
                ButtonsGroupRows: 7,
                Buttons: flatten(cards.map((card: Card) => this.card(card)))
            }]
        }
    }

    contact(phone: string, name: string) {
        return [
            this.text,
            {
                method: 'sendContact',
                params: [{
                    name,
                    phone_number: phone
                }]
            }
        ]
    }

    location(latitude: number, longitude: number) {
        return [
            this.text,
            {
                method: 'sendLocation',
                params: [{
                    lat: latitude,
                    lon: longitude
                }]
            }
        ]
    }

    protected card(card: Card) {
        card = super.card(card)
        let url = ''
        let buttons: Array<any> = []
        let sizeButtons = 0
        if (card.buttons) {
            const firstButton = card.buttons[0]
            if (firstButton.url) url = firstButton.url
            sizeButtons = card.buttons.length
            buttons = card.buttons.map((b: Button) => {
                let type, text
                switch (b.type) {
                    case 'url':
                    case 'web_url':
                        type = 'open-url'
                        text = b.title
                        break
                    case 'postback':
                        type = 'reply'
                        text = b.msg || b.title
                        break
                    default:
                        break;
                }
                return {
                    Columns: 6,
                    Rows: 1,
                    ActionType: type,
                    ActionBody: b.url || url,
                    Text: text
                }
            })
        }
        return flatten([{
            Columns: 6,
            Rows: 3 - (sizeButtons == 3 ? 1 : 0),
            ActionType: 'open-url',
            ActionBody: url,
            Image: card.image
        },
        {
            Columns: 6,
            Rows: 2,
            ActionType: 'open-url',
            ActionBody: url,
            Text: `<font color=#323232><b>${card.title}</b></font>
            <font color=#777777><br>${card.subtitle}</font>`,
            TextSize: "medium",
            TextVAlign: "middle",
            TextHAlign: "left"
        },
        ...buttons
        ])

    }
}