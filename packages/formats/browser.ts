import { WebFormat } from './src/platforms/website'
import { PlatformFormat } from './src/platforms/platform'
import { User } from '../../types/user'

const formats: any = {}

export default function(langDefault: string) {
    PlatformFormat.formats.forEach((name: string) => {
        formats[name] = (text: string, params: any[], data: any, user: User) => {
            const platform = new WebFormat(text, {
                session: {
                    source: 'website'
                }
            }, user)
            platform.defaultLanguage = langDefault
            if (platform[name]) {
                return platform[name](...params)
            }
            return text
        }
    })
    return {
        shareFormats: true,
        formats
    }
}