const buy = require('./buy')
const cancel = require('./cancel')

module.exports = {
    'Amazon.Purchase.Buy': buy,
    'Amazon.Purchase.Cancel': cancel
}