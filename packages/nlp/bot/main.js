
import code from './main.converse'
import processNlp from '../index'

export default async () => {
    return {
        code,
        nlp: {
            processNlp: await processNlp(__dirname + '/model/model.nlp')
        }
    }
}