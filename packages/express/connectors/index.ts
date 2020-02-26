import { MessengerBottenderConnector } from "./bottender/messenger";
import { LineBottenderConnector } from "./bottender/line";
import { ViberBottenderConnector } from "./bottender/viber";
import { TelegramBottenderConnector } from "./bottender/telegram";
import { SlackBottenderConnector } from "./bottender/slack";
import { AlexaConnector } from "./alexa";

export default {
    'messenger': MessengerBottenderConnector,
    'line': LineBottenderConnector,
    'slack': SlackBottenderConnector,
    'telegram': TelegramBottenderConnector,
    'viber': ViberBottenderConnector,
    'alexa': AlexaConnector
}