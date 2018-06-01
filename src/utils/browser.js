class Browser {
   is() {
        return typeof navigator != 'undefined'
   }
}

module.exports = new Browser()