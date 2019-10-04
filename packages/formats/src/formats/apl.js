module.exports = async (text, [document, datasources], {
    session
}) => {
   
    if (Utils.isAlexa(session)) {
        return {
            type: 'Alexa.Presentation.APL.RenderDocument',
            version: '1.0',
            datasources,
            document
        }
    }

    return text
}