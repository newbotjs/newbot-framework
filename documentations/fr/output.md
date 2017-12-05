# Envoyer une réponse

Pour envoyer une réponse, suivez les instructions suivantes :

```converse
@Event('start') {
    > Hello
}
```

En javascript, vous pouvez exécuter le script avec la méthode `exec()` :

```js
const converse = new Converse()
// ...
converse.exec('hello world', 'user id', (output, done) => {
    console.log(output) // Hello
    done()
}).then(() => {
    console.log('script terminé')
})
```

# Saisie de l'utilisateur

A tout moment, vous pouvez demander à l'utilisateur de saisir de texte. L'adresse de l'instruction est sauvegardé. Ainsi, en réalisant à nouveau un `.exec()` en Javascript, le scénario continuera 

```converse
@Event('start') {
    > What your name ?
    Prompt()
    > Hello !
}
```
