const Utils = require('../src/utils')
const formats  = require('../src/formats')

module.exports = (langDefault) => {

    Utils.defaultLanguage = langDefault

    return {
        shareFormats: true,
        formats,
        functions: {
            Typing: {
                $params: ['data'],
                $call({ session }) {
                    if (!Utils.isWebSite(session)) {
                        session.sendTyping()
                    }  
                }
            },
            profile: {
                $params: ['data', 'user'],
                async $call({ session }, user) {
                    let profile = {}
                    if (Utils.isBottenderFacebook(session)) {
                        const ret = await session.context.getUserProfile()
                        profile = {
                            name: ret.first_name,
                            fullname: `${ret.first_name} ${ret.last_name}`,
                            image: ret.profile_pic,
                            lang: ret.locale,
                            gender: ret.gender
                        }
                    }
                    else if (Utils.isBottenderLine(session)) {
                        const ret = await session.context.getUserProfile()
                        profile = {
                            name: ret.name,
                            image: ret.pictureUrl
                        }
                    }
                    else if (Utils.isBottenderViber(session)) {
                        const ret = await session.context.getUserDetails()
                        profile = {
                            name: ret.name,
                            image: ret.avatar,
                            lang: ret.language,
                            country: ret.country
                        }
                    }
                    else if (Utils.isBottenderTelegram(session)) {
                        const { from:ret } = session.context.event.inlineQuery()
                        profile = {
                            name: ret.first_name,
                            fullname: `${ret.first_name} ${ret.last_name}`,
                            lang: ret.language_code
                        }
                    }
                    user.setMagicVariable('profile', profile)
                }
            }
        }
    }
}