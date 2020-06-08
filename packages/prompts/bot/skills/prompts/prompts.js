import isEmail from 'validator/lib/isEmail'
import formats from 'newbot-formats'
import chrono from 'chrono-node'
import ChoiceRecognizers from '@microsoft/recognizers-text-choice'
import NumberRecognizers from '@microsoft/recognizers-text-number'
import SequenceRecognizers from '@microsoft/recognizers-text-sequence'
import code from './prompts.converse'
import languages from '../../languages'

const getlang = function (params) {
    const {
        user
    } = params
    let lang = user.getLang()
    let langName
    if (lang) {
        lang = lang.split('_')[0]
    } else {
        lang = 'en'
    }
    if (!chrono[lang]) {
        lang = 'en'
    }
    switch (lang) {
        case 'en':
            langName = 'English'
            break;
        case 'fr':
            langName = 'French'
            break
    }
    return {
        langId: lang,
        langName
    }
}

const commonParse = function (type, text, converse) {
    let fn
    const {
        langName
    } = getlang(converse)
    switch (type) {
        case 'number':
            fn = NumberRecognizers.recognizeNumber
            break
        case 'bool':
            fn = ChoiceRecognizers.recognizeBoolean
            break
        case 'phone':
            fn = SequenceRecognizers.recognizePhoneNumber
            break
    }
    const ret = fn(text, ChoiceRecognizers.Culture[langName])
    if (ret.length > 0) {
        return ret[0].resolution.value
    }
    return null
}

const commonFormat = function (text, obj, {
    session
}) {
    const isWebSite = session.message.source === 'website'
    if (isWebSite) {
        return {
            text,
            ...obj
        }
    }
    return text
}

export default {
    code,
    languages,
    functions: {
        isEmail,
        parseDate(text) {
            const {
                langId
            } = getlang(this.converse)
            return chrono[langId].parseDate(text)
        },
        parseChoice(text) {
            return commonParse('bool', text, this.converse)
        },
        parseNumber(text) {
            return commonParse('number', text, this.converse)
        },
        parsePhone(text) {
            return commonParse('phone', text, this.converse)
        }
    },
    skills: {
        formats
    },
    formats: {
        date(text, params, data) {
            return commonFormat(text, {
                date: true
            }, data)
        },
        number(text, [min, max], data) {
            return commonFormat(text, {
                number: {
                    min,
                    max
                }
            }, data)
        },
    }
}
