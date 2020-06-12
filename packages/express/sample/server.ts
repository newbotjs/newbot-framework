import express from 'express'
import { NewBotExpressServer } from '../server'

const app = express()

class MockConverse {
    exec(...args) {
        console.log(args)
    }
}

app.get('/proactive/:id', (req, res, next) => {
    res.json(true)
})

const newbotServer = new NewBotExpressServer(app, {
    botPath: __dirname,
    baseUrl: 'https://',
    /*whatsapp: {
        path: '/webhook/',
        accessToken: process.env.ACCESS_TOKEN,
        accountSid: process.env.ACCOUNT_SID,
        phoneNumber: process.env.PHONE_NB
    },*/
    gactions: {
        generate: false,
        path: '/webhook/',
        projectId: 'test',
        generateDir: __dirname + '/gactions',
        triggers: {
            en: 'Speack with'
        }
    }
})

const { server } = newbotServer.registerRoutes() 

server.listen(3010, () => {
    console.log('Ok !')
}) 
