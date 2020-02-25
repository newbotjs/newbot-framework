import formats from './'

export default (langDefault: string) => {
    return {
        shareFormats: true,
        formats: formats(langDefault)
    }
}