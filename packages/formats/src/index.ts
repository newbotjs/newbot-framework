import platforms from './platforms'
import { User } from '../../../types/user'
import listFormats from './formats.json'

const formats: any = {};
listFormats.forEach((name: string) => {
    formats[name] = (text: string, params: any[], { session }: any = {}, user: User) => {
        if (!session) {
            return text
        }
        const { source, agent } = session.message || session
        const p = platforms[source + (agent ? '-' + agent : '')]
        if (p) {
            const platform = new p(text, session, user)
            if (!platform[name]) {
                return text
            }
            return platform[name](...params)
        }
        return text
    }
})

export default formats