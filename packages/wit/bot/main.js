import witSkill from '../'
import code from './main.converse'

export default {
    code,
    skills: {
        witSkill: witSkill({
            accessToken: process.env.WIT_TOKEN
        })
    }
} 
