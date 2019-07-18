const { init, connector } = require('./botbuilder-dialog')

module.exports = ({
    settings,
    app,
    converse
}) => {
    init(settings, converse)
    app.post(settings.path || '/botframework', connector.listen())
}
