const StyleSheetMixins = require('./mixins/StyleSheetMixins.js')

module.exports = class Mixins {
  /**
   * @mixin import
   * Import a file or directory of files into the style sheet.
   */
  static import () {
    return StyleSheetMixins.import(...arguments)
  }

  static process (mixin, cb) {
    if (!this.hasOwnProperty(mixin.name)) {
      throw ErrorUtils.createError({
        message: `Invalid mixin "${mixin.name}"`
      })
    }

    this[mixin.name](mixin, cb)
  }
}
