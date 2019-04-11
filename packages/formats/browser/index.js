export default {
    formats: {
        quickReplies(text, actions) {
            return {
                text,
                actions
            }
        },
        email(text) {
            return {
                text,
                email: true
            }
        },
        phone(text) {
            return {
                text,
                phone: true
            } 
        }
    },
    shareFormats: true
}