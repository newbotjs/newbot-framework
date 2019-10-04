module.exports = (name, productId) => {
    return {
        type: "Connections.SendRequest",
        name,
        payload: {
            InSkillProduct: {
                productId
            }
        },
        token: "correlationToken"
    }
}