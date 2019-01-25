const { NewBot } = require('../../../index')
const newbotNlp = require('../index')
const mainSkill = require('../dist/node/bot')

const converse = new NewBot(mainSkill)

newbotNlp.loadModel(converse, `${__dirname}/../nlp/model.nlp`)

converse.exec('hey', 'user_id', (output, done) => {
    console.log(output)
    done()
}).catch(err => console.log(err))