# Démarrer une conversation

```converse
@Event('start')
start() {
    > Welcome !
}
```

Examinons le code :

1. Un dialogue est représentée par une fonction. Ici, `start()`
2. Cette fonction est déclenché par un décorateur `Event` et son paramètre `start`
3. Le script renvoie une réponse `Welcome !`

Facile, n'est ce pas ?