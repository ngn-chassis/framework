const LayoutMixins = require('./mixins/LayoutMixins.js')
const StyleSheetMixins = require('./mixins/StyleSheetMixins.js')

const Mixins = {
  'constrain-width': LayoutMixins.constrainWidth,
  import: StyleSheetMixins.import
}

module.exports = Mixins
