import assert from 'assert'
import formatsFn from '../src'
import User from '../../../src/user'

const formats = formatsFn('en_EN')

describe('Quick replies Test', () => {

    const ask = (_session, params) => {
        const text = 'Hey'
        if (typeof _session == 'string') {
            _session = {
                source: _session
            }
        }
        const session = {
            message: _session
        }
        return {
            text,
            params,
            output: formats['quickReplies'](text, [params], { session }, new User()) 
        }
    }

    it('Website Test', () => {
        const { text, params, output } = ask('website', ['yes', 'no'])
        assert.deepEqual(output, {
            text,
            actions: params
        })
    })
})