
import code from './main.converse'
import processNlp from '../index'

export default {
    code,
    nlp: {
        processNlp: processNlp('model/model.nlp')
    }
}