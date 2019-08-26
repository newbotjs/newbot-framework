const builder = require('botbuilder')
const Utils = require('../utils')
const _ = require('lodash')
const { buttons } = require('./buttons')

module.exports = (text, [params = {}], {
    session
}, user) => {
    let { url, data } = params
    if (!url.startsWith('http')) {
        const baseUrl = process.env.SERVER_URL
        url = (baseUrl ? baseUrl : '') + url
    }
    const btoa = str => Buffer.from(str).toString('base64')
    const pdata = encodeURIComponent(btoa(JSON.stringify(data || {})))
    url += `?data=${pdata}&webview=true`
    if (Utils.isWebSite(session)) {
        return {
            text,
            webview: {
                url,
                height: params.height
            }
        }
    }
    return buttons(session, text, [
        {
            type: 'webview',
            url,
            title: params.button,
            height: params.height
        } 
    ], user)
}