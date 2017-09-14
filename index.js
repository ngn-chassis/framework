const postcss = require('postcss')
const ChassisPostCss = require('./src/plugin.js')

module.exports = postcss.plugin('ngn-chassis', (cfg) => new ChassisPostCss(cfg))
