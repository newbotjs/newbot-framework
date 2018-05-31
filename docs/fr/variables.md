# Remarque importante, avant tout

Il faut savoir qu'une variable est propre **à un utilisateur**. Si vous relancez le script avec un autre utilisateur (c'est à dire avec un autre identifiant), les valeurs seront différentes.

# Une variable locale

La création d'un variable est très simple

```converse
name = 'ana'
```

Dans une fonction :

```converse
start() {
    name = 'ana'
}
```

Cette variable est locale à la fonction. Lorsque cette fonction est terminée, les variables sont supprimées pour libérer la mémoire

# Variable globale

Une variable globale peut être utilisée dans tout le script. Elles appartient à l'utilisateur. Une variable globale est préfixée de `$`

```converse
$name = '' // initialisation

start() {
    $name = 'ana'
}
```

