const merge = require('lodash/merge')
const isString = require('lodash/isString')
const isObjectLike = require('lodash/isObjectLike')
const isFunction = require('lodash/isFunction')
const clone = require('lodash/clone')
const cloneDeep = require('lodash/cloneDeep')
const isArray = require('lodash/isArray')
const set = require('lodash/set')
const get = require('lodash/get')
const isUndefined = require('lodash/isUndefined')
const isNull = require('lodash/isNull')
const isBoolean = require('lodash/isBoolean')
const random = require('lodash/random')
const last = require('lodash/last')
const isNaN = require('lodash/isNaN')
const flatten = require('lodash/flatten')
const difference = require('lodash/difference')
const isPlainObject = require('lodash/isPlainObject')
const isNumber = require('lodash/isNumber')

module.exports = {
    merge,
    isString,
    isObjectLike,
    isPlainObject,
    isFunction,
    clone,
    cloneDeep,
    isArray,
    get,
    set,
    isUndefined,
    isNull,
    isBoolean,
    isNumber,
    random,
    last,
    flatten,
    isNaN,
    difference
}