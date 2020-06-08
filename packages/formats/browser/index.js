module.exports = {
    formats: {
        quickReplies(text, [actions]) {
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
        },
        image(text, url) {
            return {
                text,
                image: url
            } 
        },
        video(text, url) {
            return {
                text,
                video: url
            } 
        },
        buttons(text, [buttons]) {
            return {
                text,
                buttons
            }
        },
        carousel(text, [cards, actions]) {
            return {
                text,
                cards,
                actions
            }
        }
    },
    shareFormats: true
}