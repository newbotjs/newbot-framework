import express from 'express'
import { NewBotExpressServer } from '../server'

const app = express()

const newbotServer = new NewBotExpressServer(app, {
    botPath: __dirname
})

newbotServer.registerRoutes()

app.listen(3000, () => {
    console.log('Ok !')
})

