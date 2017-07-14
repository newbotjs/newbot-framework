const builder = require('botbuilder')

module.exports = (converse) => {
    converse.format('carousel', (text, [cards], { session }) => {
        cards = cards.map(card => {
            const heroCard = new builder.HeroCard(session)
            ['title', 'subtitle', 'text'].forEach(p => {
                if (card[p]) heroCard[p](card[p])
            })
            return heroCard
        })

        return new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(cards)
    })
}