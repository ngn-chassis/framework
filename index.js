const postcss = require('postcss')
const Chassis = require('./src/plugin.js')

module.exports = postcss.plugin('ngn-chassis', (cfg) => new Chassis(cfg))
