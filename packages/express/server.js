const bodyParser = require('body-parser')
const express = require('express')
const socketIo = require('socket.io')
const fs = require('fs')
const _ = require('lodash')
const { NewBot } = require('newbot')
const botbuilder = require('./connectors/botbuilder')
const gactions = require('./connectors/gactions')
const bottender = require('./connectors/bottender')
const twitter = require('./connectors/twitter')
const alexa = require('./connectors/alexa/alexa')
const proactive = require('./proactive')

module.exports = function(settings, app, converse) {

    let mainSkill
    
    if (!converse) {
        const botPath = settings.botPath + '/dist/node/bot.js'
        if (!fs.existsSync(botPath)) {
            console.log('Bot skill not exists. use "newbot build" before')
            process.exit()
        }
        mainSkill = require(botPath)
        const converseOptions = {}
        if (settings.modelPath) {
            converseOptions.model = settings.modelPath
        }
        converse = new NewBot(mainSkill, converseOptions)
    }
    
    let config
    if (settings.botConfigFile && !_.isString(settings.botConfigFile)) {
        config = settings.botConfigFile
    }
    else {
        config = require(settings.botPath + '/' + (settings.botConfigFile || 'newbot.config'))
    }

    const getSettings = (platformName) => {
        const production = _.get(config, 'production.platforms.' + platformName)
        const dev = _.get(config, 'platforms.' + platformName)
        const obj = _.merge(process.env.NODE_ENV == 'production' ? production : dev, settings[platformName])
        obj.output = settings.output || {}
        return obj
    }

    if (settings.alexa) {
        alexa({
            settings: getSettings('alexa'),
            app,
            converse
        })
    }
    
    app.use(
        bodyParser.json({
            verify: (req, res, buf) => {
                req.rawBody = buf.toString();
            },
        })
    )
    
    if (settings.botframework) {
        botbuilder({
            settings: getSettings('botframework'),
            app,
            converse
        })
    }

    if (settings.gactions) {
        gactions({
            settings: getSettings('gactions'),
            app,
            converse
        })
    }

    if (settings.twitter) {
        twitter({
            settings: getSettings('twitter'),
            app,
            converse
        })
    };
    

    ['messenger', 'viber', 'telegram', 'line', 'slack'].forEach(platform => {
        if (settings[platform]) {
            bottender({
                settings: getSettings(platform),
                platform,
                app,
                converse
            })
        }
    })

    app.use('/webview', express.static(settings.botPath + '/webviews'))

    return {
        converse,
        config,
        proActiveEvent: proactive(settings, getSettings, converse)
    }
}


