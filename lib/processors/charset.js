const postcss = require('postcss')

module.exports = postcss.plugin('charset', cfg => root => new Promise((resolve, reject) => {
  root.prepend(`@charset "${cfg.charset}"`)
  resolve(root)
}))
