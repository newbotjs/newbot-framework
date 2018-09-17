import dialogflowSkill from '../'
import code from './main.converse'

export default {
    code,
    skills: {
        dialogflowSkill: dialogflowSkill({
            projectId: 'newagent-2431a',
            sessionId: 'quickstart-session-id',
            languageDefault: 'en-EN',
            credentials: '/home/samuel/www/.key/NewAgent-4cff0b6ec5a7.json'
        })
    }
} 
