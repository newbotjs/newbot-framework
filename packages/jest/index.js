module.exports = {
    transform: {
        "\\.converse$": "<rootDir>/node_modules/newbot/packages/jest/loader.js",
        "^.+\\.js$": "babel-jest"
    },
    moduleFileExtensions: [
        "js"
    ]
}