import platforms from './platforms'
import { User } from '../../../types/user'
import { PlatformFormat } from './platforms/platform'

const formats: any = {};
let listFormats: Array<string> = PlatformFormat.formats

for (let p in platforms) {
    const platform = platforms[p]
    if (platform.extraFormats) {
        listFormats = [...listFormats, platform.extraFormats]
    }
}

export default function(langDefault: string) {
    listFormats.forEach((name: string) => {
        formats[name] = (text: string, params: any[], { session }: any = {}, user: User) => {
            if (!session) {
                return text
            }
            let { source, agent } = session.message || session
            if (source == agent) {
                agent = undefined
            }
            const p = platforms[source + (agent ? '-' + agent : '')]
            if (p) {
                const platform = new p(text, session, user)
                if (!platform[name]) {
                    return text
                }
                platform.defaultLanguage = langDefault
                return platform[name](...params)
            }
            return text
        }
    })
    return formats
}