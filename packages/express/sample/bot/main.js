import formats from 'newbot-formats'

export default {
    code: `
        @Event('start')
        start() {
            @Format('image', 'https://newbot.io/images/logo.png')
            > ok
        }
    `,
    skills: {
        formats
    }
}