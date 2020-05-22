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
    botPath: __dirname
}, new MockConverse())

const { server } = newbotServer.registerRoutes() 

server.listen(3000, () => {
    console.log('Ok !')
}) 
