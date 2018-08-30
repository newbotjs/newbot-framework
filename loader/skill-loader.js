exports.translate = function (load) {
    const converseUrlRegex = /file\s*:\s*(['"`](.*?)['"`])/g
    const relativePathRegex = /^\.{1,2}\//i
    const pathToApp = load.address
        .replace(this.baseURL, "")
        .replace(new RegExp("[^/]+$"), "")
    load.source = load.source.replace(/(import\s*.*?\s*from) \s*(['"`](.*?)['"`])/g, ($0, str, quotedUrl, path) => {
        if (path[0] == '.') {
            return $0
        }
        return `${str} '@node/${path}'`
    })
    load.source = load.source.replace(
        converseUrlRegex,
        function replaceMatch($0, quotedUrl, url) {
            const absoluteUrl = relativePathRegex.test(url) ?
                (pathToApp + url) :
                url;
            return (`file: "${ absoluteUrl }"`)
        }
    )
}
