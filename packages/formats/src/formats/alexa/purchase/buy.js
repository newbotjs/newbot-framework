const Utils = require('../../../utils')
const schema = require('./schema')

module.exports = (text, [productId], {
    session
}) => {
   
    if (Utils.isAlexa(session)) {
        return schema('Buy', productId)
    }

    return text
}