import { FormatInterface, Button, Card } from '../format.interface'
import { PlatformFormat } from '../platform'
import { User } from '../../../../../types/user'

export class WebFormat extends PlatformFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    quickReplies(actions : Array<any>): { text: string, actions: Array<any>} {
        actions = actions.map(action => this.toByLang(action))
        return {
            text: this.text,
            actions
        }
    }

    buttons(buttons: Array<Button>): { text: string, buttons: Array<any>} {
        return {
            text: this.text,
            buttons: buttons.map((b: Button) => this.mapButton(b))
        }
    }

    location(latitude: number, longitude: number): any {
        return {
            text: this.text,
            location: {
                latitude,
                longitude
            }
        }
    }

    contact(phone: string, name: string) {
        return {
            text: this.text,
            contact: {
                phone,
                name
            }
        }
    }

    phone() {
        return {
            text: this.text,
            phone: true
        } 
    }

    image(url: string) {
        return {
            text: this.text,
            image: url
        } 
    }

    video(url: string) {
        return {
            text: this.text,
            video: url
        } 
    }

    carousel(cards: Array<Card>) {
        return {
            text: this.text,
            cards
        }
    }

    webview(params: any = {}) {
        const url = this.webviewUrl(params)
        return {
            text: this.text,
            webview: {
                url,
                height: params.height
            }
        }
    }
}