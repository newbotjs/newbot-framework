# Intents

Le décorateur `@Intent` permet de déclencher une fonction selon une intention de l'utilisateur. Tout d'abord, créez des régles d'intention :

```js
converse.nlp('regexp', {
    greeting(str) {
        const match = /(hello|hey|hi)/i.exec(str)
        if (!match) return false
        return { greetingData: match[0] }
    }
})
```

Nous précisons des régles d'expression régulière.
1. Nous regardons le motif (ici, `hello`, `hey` ou `hi`)
2. Si nous ne trouvons pas le motif, nous renvoyons `false`
3. Sinon, nous renvoyons un objet utilisable avec la variable magique `:intent`

```converse
@Intent('greeting')
greeting() {
    > Hey ! {:intent.greetingData} 
}
```

La fonction `greeting` est lancée. Si l'utilisateur envoie `hi`, la réponse sera `Hey ! hi`

# Créer votre propre système NLP