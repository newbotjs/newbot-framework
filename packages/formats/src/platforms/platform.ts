import { User } from "../../../../types/user"
import rp from 'request-promise'
import { Button, Card } from "./format.interface"

export class PlatformFormat {

    static LANGS_ID = ['fr_FR', 'en_EN']

    constructor(
            protected text: string, 
            protected session: { message: { source: string } }, 
            protected user: User
    ) { }

    actived() {
        const { source } = this.session.message
        return source === this['name']
    }

    protected getByLang(prop: any, _default: string = 'en_EN') {
        const lang = this.user.getLang()
        if (prop && lang) {
            if (prop[lang]) {
                return prop[lang]
            }
            else if (prop[this.defaultLanguage]) {
                return prop[this.defaultLanguage]
            }
            else {
                const [lang] = Object.keys(prop)
                if (PlatformFormat.LANGS_ID.indexOf(lang) != -1) {
                    return prop[lang]
                }
            }
        }
        if (_default) {
            return prop[_default]
        }
        return prop
    }

    protected toByLang(obj: any) {
        if (typeof obj == 'string') return obj
        for (let prop in obj) {
            obj[prop] = this.getByLang(obj[prop])
        }
        return obj
    }

    protected async sizeFile(url: string) {
        const {
            headers
        } = await rp({
            url,
            method: 'GET',
            resolveWithFullResponse: true
        })
        return headers['content-length']
    }

    protected mapButton(b: Button) {
        b = this.toByLang(b)
        /*if (b.event) {
            b.type = 'webview'
            b.url = 'https://example.com'
        }*/
        if (!b.event) {
            if (!b.type && !b.url) b.type = 'postback'
            else if (!b.type) b.type = 'web_url'
        }
        return b
    }

    protected inlineQuickReplies(actions: Array<any>) {
        return actions.map(action => {
            action = this.toByLang(action)
            if (typeof action != 'string') {
                return action.text
            }
            return action
        })
    }

    quickReplies(actions: Array<any>): object | string {
        actions = this.inlineQuickReplies(actions)
        return `${this.text} (${actions.reduce((a, b) => a + ', ' + b)})`
    }

    protected card(card: Card): Card {
        card = this.toByLang(card)
        if (card.buttons) {
            card.buttons = card.buttons.map((b: Button) => this.mapButton(b))
        }
        return card
    }
}