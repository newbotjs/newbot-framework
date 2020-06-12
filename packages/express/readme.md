## NewBot Express 

You can add your own platform

1. You must create a Session class for the platform
2. You can add formats for the platform
3. Add the platform to the current package

## Create Session

In `sessions` packages:

1. Create `<platform>.ts` in `platforms` directory :

```ts
import { SessionInterface } from '../session.interface';

export class MyPlatformSession implements SessionInterface {

    channel: any
    readonly platform: string = 'myplatform'

    constructor(private context: any) {
        // context is a your object to send a message
        this.context = context
    }

    send(output) {
        // example: this.context.send(...)
    }

    get message() {
        return {
            source: this.platform,
            agent: this.platform,
            user: this.user
        }
    }

    get user() {
        return {
            id: // here, user id. Example: this.context.userId
        }
    }

    get source() {
        return this.message.source
    }
}
```

2. Add your platform in `index.ts`

## Create Format

In `formats` packages:

1. Create `<platform>/index.ts` directory in `src/platforms` directory :

```ts
import { FormatInterface } from '../format.interface'
import { User } from '../../../../../types/user'
import { PlatformFormat } from '../platform'

export class MyPlatformFormat extends PlatformFormat implements FormatInterface {

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    image(url: string) {
        return {
            text: this.text,
            url
        }
    }

}
```

Methods must be known names: 

- "image",
- "video",
- "quickReplies",
- "buttons",
- "location",
- "contact",
- "phone",
- "email",
- "carousel",
- "signin",
- "webview"

If you want to add your own format (platform specific):

```ts
import { FormatInterface } from '../format.interface'
import { User } from '../../../../../types/user'
import { PlatformFormat } from '../platform'

export class MyPlatformFormat extends PlatformFormat implements FormatInterface {

    static extraFormats: Array<string> = [
        'MyPlatform.yourFormatName'
    ]

    constructor(text: string, session: any, user: User) {
        super(text, session, user)
    }

    'MyPlatform.yourFormatName'(params) {
        return {
            text: this.text,
            params
        }
    }
}
```

Use `extraFormats` static property

2. Add your platorm in `src/platforms/index.ts`:

Key is `<platform>` or `<platform>-<agent>`

## Add In NewBot Express package

In `express` packages:

1. Create `connectors/<platform>/index.ts` directory :

```ts
import { Connector } from "../connector";
import { PlatformConnector } from "../connector.interface";
import { MyPlatformSession } from 'newbot-sessions'

export class MyPlatformConnector extends Connector implements PlatformConnector {

    constructor(app: any, converse: any, settings: any) {
        super(app, converse, settings)
    }

    handler(body: any, res: any) {
        //return this.exec(text, session)
    }

    event(event: any, user: any) {
         //return this.exec(event, session)
    }

    registerRoutes() {
        // this.settings
       // this.app.get(this.routePath(), (res, res, next) => {})
    }

    proactive(obj: any) {
        
    }

}
```

- `handler` is a method to call when running the chatbot
- `event` is to be called to execute an event in the scenario (@Event)
- `registerRoutes` is executed from the loading of the connector to put a webhook
- `proactive` is a method called proactively

2. Add your platform in `connectors/index.ts`