# NewBot Framework

<p align="center"><a href="https://newbot.io" target="_blank" rel="noopener noreferrer"><img width="100" src="https://newbot.io/images/logo-medium.png" alt="NewBot"></a></p>

<p align="center">
<a href="https://www.npmjs.com/package/newbot" target="_blank"><img src="https://img.shields.io/npm/v/newbot.svg"></a>
<a href="https://www.npmjs.com/package/newbot"><img src="https://img.shields.io/npm/l/newbot.svg" alt="License"></a>
</p>

## Website

https://newbot.io

## Description

Javascript Framework for creating conversational scripts :
- your own chatbot
- chatbot on external messaging
    - Facebook Messenger
    - Amazon Alexa
    - Google Assistant
    - Slack
    - Viber
    - Telegram
    - Line
    - Twitter
    - BotFramework (Skype, Microsoft Teams, etc.)
- conversational website
    - you can do a client / server relationship
    - or you can use it directly in a browser (offline)

## Get Started

1. Use `newbot-cli` to create a project:

`npm install -g newbot-cli`

2. Create a new project called `my-chatbot`

`newbot new my-chatbot`

3. Start a local server

`cd my-chatbot`
`newbot serve`

4. Download the emulator https://github.com/Microsoft/BotFramework-Emulator/releases
    a. In the emulator, click on `File > Open Bot`
    b. Select the `emulator.bot` file at the root of your project

5. Test

> If you go on the localhost:3000 of your browser, you will have the logs of the conversations

## The promises of the framework

Name | Description | Docs
:--- | :--- | :---
Modules | A skill is an independent module. This helps structure the project and share skills | [📝](https://newbot.io/en/docs/essential/write-skill.html)
Special syntax script for dialog manager | Called ConverseScript, it simplifies the writing of dialogs | [📝](https://newbot.io/en/docs/essential/write-converse.html)
Tools with NewBot CLI | Create, Generate, Test, Deploy, etc. | [📝](https://newbot.io/en/docs/cli/cli.html)
Unit tests | Create powerful unit tests | [📝](https://newbot.io/en/docs/unit-tests/test.html)
NLP | Native NLP, external services (DialogFlow, NewBot Cloud, etc.) or your own NLP system | [📝](https://newbot.io/en/docs/nlp/native.html)
Internationalisation | Easily integrate chatbot responses into multiple languages | [📝](https://newbot.io/en/docs/i18n/i18n.html)
Save the user's progress in the scenario | -- | [📝](https://newbot.io/en/docs/avanced/save.html)

## Script for dialog manager

When you create a skill, you use a special syntax to create dialogs. Why ? What are the benefits?

1. It's much more readable
2. Do not worry, the syntax is easy to learn because it is close to the syntax of Javascript
3. It's really a language, you can create functions, conditions, loops, variables, arrays, objects, and so on.


## Documentation

You can see all the documentation on https://newbot.io/en/docs

## License

MIT