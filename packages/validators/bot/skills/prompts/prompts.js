import isEmail  from 'validator/lib/isEmail'
import code from './prompts.converse'
import languages from '../../languages'

export default {
    code,
    languages,
    functions: {
        isEmail
    }
}