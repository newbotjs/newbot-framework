export type Card = {
    type: string,
    title: string,
    buttons: Array<Button>,
    subtitle?: string,
    image?: string
}

export type Button = {
    type: string,
    url?: string,
    title?: string,
    msg?: string,
    height?: string,
    phone_number?: string
    event?: string,
    tweet?: any
}

export interface FormatInterface {
    image?(url: string, contentType?: string, name?: string, thumbnail?: string): any
    video?(url: string, contentType?: string, name?: string, options?: {
        thumbnail: string,
        duration: string,
        size: string
    }): any
    quickReplies?(actions: Array<string | object>): any
    buttons?(buttons: Array<Button>): any
    location?(latitude: number, longitude: number, options?: {
        title?: string,
        address?: string
    }): any
    contact?(phone: string, name: string): any
    carousel?(cards: Array<Card>): any
}