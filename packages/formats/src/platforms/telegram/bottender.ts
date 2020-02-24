import { FormatInterface, Button, Card } from '../format.interface'
import { User } from '../../../../../types/user'
import { PlatformFormat } from '../platform'

export class TelegramBottenderFormat extends PlatformFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    image(contentUrl: string, contentType: string, name: string): any {
        return [
            this.text,
            {
                method: 'sendPhoto',
                params: [
                    contentUrl, 
                {
                    caption: name
                }]
            }
        ]
    }

    video(contentUrl: string, contentType: string, name: string, {
        thumbnail = '',
        duration = ''
    } = {}) {
        return {
            method: 'sendVideo',
            params: [
                contentUrl,
                {
                    thumb: thumbnail,
                    duration,
                    caption: this.text
                }
            ]
        }
    }

    contact(phone: string, name: string) {
        return [
            this.text,
            {
                method: 'sendContact',
                params: [{
                    first_name: name,
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
                    latitude,
                    longitude
                }]
            }
        ]
    }

    buttons(buttons: Array<Button>) {
        const buttonsClone = buttons.map((b: Button) => {
            b = this.mapButton(b)
            let obj: any = {
                text: b.title,
                callback_data: b.msg || b.title
            }
            switch (b.type) {
                case 'url':
                case 'web_url':
                    obj.url = b.url
                    break
            }
            return [obj]
        })
        return {
            method: 'sendMessage',
            params: [
                this.text,
                {
                    reply_markup: JSON.stringify({
                        inline_keyboard: buttonsClone
                    })
                }
            ]
        }
    }

    quickReplies(actions: Array<any>) {
        actions = actions.map(action => {
            if (typeof action == 'string') {
                return {
                    text: action
                }
            }
            action = this.toByLang(action)
            return [{
                text: action.text
            }]
        })
        return {
            method: 'sendMessage',
            params: [
                this.text,
                {
                    reply_markup: JSON.stringify({
                        keyboard: actions,
                        one_time_keyboard: true
                    })
                }
            ]
        }
    }

}