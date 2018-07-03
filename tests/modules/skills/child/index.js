module.exports = {
    code: `
        @Intent(/hello/i)
        hello() {
            > Child
            Prompt()
            > Test
        }

        foo() {
            > Lazy 3
        }

        lazy(b) {
            > Lazy {b}
            Prompt()
            > Lazy 2
            foo()
            Prompt()
            > Lazy 4
        }
`,
    functions: {
        jsFunction() {
            return 'js'
        }
    }
}
