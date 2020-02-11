const Config = require('../Config.js')

module.exports = class ViewportUtils {
  static #validOperators = ['<', '<=', '=', '>=', '>', 'from', 'to']

  static get widthRanges () {
    let { widthRanges } = Config.viewport

    // if (typeof widthRanges === 'string') {
    //   console.log(widthRanges);
    // }

    return widthRanges
  }
}
