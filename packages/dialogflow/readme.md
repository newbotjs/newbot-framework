# Description

Integrate the DialogFlow skill into NewBot

# Installation

Install with

`npm install newbot-dialogflow`

# Use

1. In your skill, import the package
2. Add the skill in the `skills` property and configure

```js
import dialogflow from 'newbot-dialogflow'
import code from './main.converse'

export default {
    code,
    skills: {
        dialogflow: dialogflowSkill({
            projectId: 'ENTER_PROJECT_ID_HERE',  // https://dialogflow.com/docs/agents#settings,
            sessionId: 'quickstart-session-id',
            languageDefault: 'en-EN', // optionnal
            credentials: 'PATH_TO_JSON_FILE' // https://cloud.google.com/docs/authentication/production
        })
    }
} 
```

# Use in ConverseScript

In `main.converse` : 

## Get Response

```ts
@Intent('input.welcome')  // action name
welcome() {
    > { :intent.response  } // response
} 
```

## Get Response

```ts
@Intent('input.welcome')  // action name
welcome() {
    > Hey { :intent.firstname.value  } // display parameter "firstname"
} 
```

## Get Error

```ts
@Intent('dialogflow.error')
error() {
    > { :intent.error } // display JS error
}
```