# NewBot Framework

# ![NewBot Framework](https://newbot.io/images/logo-medium.png)

**NewBot Framework is an open source Javascript framework for building chatbots, for 15 messaging platforms, with a modular and original dialogue system**

## Website

https://newbot.io

## Try

- Sample Example : https://codesandbox.io/s/newbot-framework-sample-bj2lw
- Tutorial : [Develop a chatbot in a few minutes with NewBot Framework](https://tutorials.botsfloor.com/develop-a-chatbot-in-a-few-minutes-with-newbot-framework-4584c92b64cb)

## Platforms

- [Facebook Messenger](https://tutorials.botsfloor.com/create-facebook-messenger-bot-with-newbot-framework-584aa48870bd)
- [Amazon Alexa](https://tutorials.botsfloor.com/develop-an-alexa-skill-with-newbot-framework-bonus-add-units-tests-1e5a7f302e72)
- Google Assistant
- Slack
- Viber
- Telegram
- Line
- Twitter
- with BotFramework
    - Skype
    - Ms Teams
    - Kik
    - Twilio
    - Cortana
    - GroupeMe
- conversational website
    - you can do a client / server relationship
    - or you can use it directly in a browser (offline)

## Features

Name | Description | Docs
:--- | :--- | :---
Modules | A skill is an independent module. This helps structure the project and share skills | [📝](https://newbot.io/en/docs/essential/write-skill.html)
Special syntax script for dialog manager | Called ConverseScript, it simplifies the writing of dialogs | [📝](https://newbot.io/en/docs/essential/write-converse.html)
Tools with NewBot CLI | Create, Generate, Test, Deploy, etc. | [📝](https://newbot.io/en/docs/cli/cli.html)
Unit tests | Create powerful unit tests | [📝](https://newbot.io/en/docs/unit-tests/test.html)
NLP | Native NLP, external services (DialogFlow, NewBot Cloud, etc.) or your own NLP system | [📝](https://newbot.io/en/docs/nlp/native.html)
Internationalization | Easily integrate chatbot responses into multiple languages | [📝](https://newbot.io/en/docs/i18n/i18n.html)
Save the user's progress in the scenario | -- | [📝](https://newbot.io/en/docs/avanced/save.html)

## Get Started

1. Use `newbot-cli` to create a project:

`npm install -g newbot-cli`

2. Create a new project called `my-chatbot`

`newbot new my-chatbot`

3. Start a local server

`cd my-chatbot`
`newbot serve`

4. Go to `localhost:3000` and test

## Create sample chatbot

When you create a skill, you use a special syntax to create dialogs. Why ? What are the benefits?

1. It's much more readable
2. Do not worry, the syntax is easy to learn because it is close to the syntax of Javascript
3. It's really a language, you can create functions, conditions, loops, variables, arrays, objects, and so on.

![Conversational script](https://newbot.io/images/code/code_front.png)

## Documentation

You can see all the documentation on https://newbot.io/en/docs

## License

MIT

## Changed

### 2020-02-19

- Fix several bugs

### 2020-02-06

- It is possible to train the chatbot on the fly
- The training now uses version 4 of the NLPJS module. The generated model is therefore different
- 1 additional browser-side file is generated (dist/newbot.with-nlp.[min].js). NLPJS content is integrated into the final file