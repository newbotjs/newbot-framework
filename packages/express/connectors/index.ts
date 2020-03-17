import { MessengerBottenderConnector } from "./bottender/messenger";
import { LineBottenderConnector } from "./bottender/line";
import { ViberBottenderConnector } from "./bottender/viber";
import { TelegramBottenderConnector } from "./bottender/telegram";
import { SlackBottenderConnector } from "./bottender/slack";
import { AlexaConnector } from "./alexa";
import { TwitterConnector } from "./twitter";
import { GactionsConnector } from "./gactions";
import { MsBotConnector } from "./ms-bot";
import { DiscordConnector } from "./discord";
import { WebConnector } from "./website";

export default {
    'messenger': MessengerBottenderConnector,
    'line': LineBottenderConnector,
    'slack': SlackBottenderConnector,
    'telegram': TelegramBottenderConnector,
    'viber': ViberBottenderConnector,
    'alexa': AlexaConnector,
    'twitter': TwitterConnector,
    'gactions': GactionsConnector,
    'msbot': MsBotConnector,
    'discord': DiscordConnector,
    'website': WebConnector
} 