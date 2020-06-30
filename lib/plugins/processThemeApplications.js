import postcss from 'postcss'

export default postcss.plugin('process-theme-applications', (stylesheet, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    theme.getApplications(stylesheet.components.collated, (err, result) => {
      if (err) {
        return cb(err)
      }

      stylesheet.registerApplications(...result)
      resolve(root)
    })
  })
})
