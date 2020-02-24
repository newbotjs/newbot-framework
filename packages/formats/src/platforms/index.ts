import { MessengerFormat } from './messenger'
import { MessengerBottenderFormat } from './messenger/bottender'
import { ActionsOnGoogleFormat } from './gactions/actions-on-google'
import { ViberBottenderFormat } from './viber/bottender'
import { TwitterFormat } from './twitter'
import { LineBottenderFormat } from './line/bottender'
import { TelegramBottenderFormat } from './telegram/bottender'
import { SlackBottenderFormat } from './slack/bottender'
import { AlexaSdkFormat } from './alexa/alexa'
import { BotBuilderFormat } from './ms-bot'
import { DiscordFormat } from './discord/discord'

const platforms: {
    [key: string]: any
} = {
    'messenger-bottender': MessengerBottenderFormat,
    'viber-bottender': ViberBottenderFormat,
    'line-bottender': LineBottenderFormat,
    'telegram-bottender': TelegramBottenderFormat,
    'slack-bottender': SlackBottenderFormat,
    'messenger': MessengerFormat,
    'gactions': ActionsOnGoogleFormat,
    'alexa': AlexaSdkFormat,
    'twitter:': TwitterFormat,
    'botbuilder': BotBuilderFormat,
    'discord': DiscordFormat
}

export default platforms