import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import { dependencies } from './package.json'

export default {
    input: 'converse.js',
    output: {
        file: 'dist/newbot.min.js',
        format: 'umd'
    },
    //external: Object.keys(dependencies),
    plugins: [
        resolve({
            preferBuiltins: false
        }),
        json(),
        commonjs()
    ]
}