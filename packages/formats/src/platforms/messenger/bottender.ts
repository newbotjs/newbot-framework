import { FormatInterface, Button } from '../format.interface'
import { MessengerFormat } from '.'
import { User } from '../../../../../types/user'

export class MessengerBottenderFormat extends MessengerFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    image(contentUrl: string | { attachmentId: string }): any {
        return this._attachment('sendImage', contentUrl)
    }

    video(contentUrl: string | { attachmentId: string }): any {
        return this._attachment('sendVideo', contentUrl)
    }

    audio(contentUrl: string | { attachmentId: string }) {
        return this._attachment('sendAudio', contentUrl)
    }

    file(contentUrl: string | { attachmentId: string }) {
        return this._attachment('sendFile', contentUrl)
    }

    private formatQuickReplies(quickReplies: Array<any>) {
        return {
            method: 'sendText',
            params: [
                this.text,
                {
                    quick_replies: quickReplies
                }
            ]
        }
    }

    private _attachment(method: string, contentUrl: string | { attachmentId: string }) {
        return [this.text, {
            method,
            params: [
                contentUrl
            ]
        }]
    }

    email(): any {
        const { quick_replies } = super.email()
        return this.formatQuickReplies(quick_replies)
    }

    quickReplies(actions: Array<any>): any {
        const { quick_replies } = super.quickReplies(actions)
        return this.formatQuickReplies(quick_replies)

    }

    buttons(buttons: Array<Button>): any {
        buttons = super.buttons(buttons)
        return {
            method: 'sendButtonTemplate',
            params: [
                this.text,
                buttons
            ]
        }
    }
} 
