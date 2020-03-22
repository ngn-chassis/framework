const postcss = require('postcss')

module.exports = postcss.plugin('box-model', (cfg, components) => root => new Promise((resolve, reject) => {
  let block = []
  let inlineBlock = []
  let inline = []

  // components.forEach(component => {
  //   console.log(component)
  // })

  if (inline.length > 0) {
    root.prepend(`
      ${inline.join(', ')} {
        color: inherit;
      	margin: 0;
      	opacity: 1;
      	padding: 0;
      	text-decoration: none;
      	text-decoration-line: none;
      	text-decoration-style: solid;
      	text-decoration-color: currentColor;
      	text-shadow: none;
      	text-transform: none;
      	unicode-bidi: normal;
      	vertical-align: baseline;
      	visibility: visible;
      	white-space: normal;
      	word-spacing: normal;
      }
    `)
  }

  if (inlineBlock.length > 0) {
    root.prepend(`
      ${inlineBlock.join(', ')} {
        background: transparent none repeat 0% 0% / auto auto padding-box border-box scroll;
      	border: medium none currentColor;
      	border-radius: 0;
      	border-image: none;
      	color: inherit;
      	margin: 0;
      	opacity: 1;
      	outline: medium none invert;
      	padding: 0;
      	text-align: inherit;
      	text-align-last: auto;
      	text-decoration: none;
      	text-decoration-line: none;
      	text-decoration-style: solid;
      	text-decoration-color: currentColor;
      	text-indent: 0;
      	text-shadow: none;
      	text-transform: none;
      	vertical-align: baseline;
      	visibility: visible;
      	white-space: normal;
      	word-spacing: normal;
      }
    `)
  }

  if (block.length > 0) {
    root.prepend(`
      ${block.join(', ')} {
        background: transparent none repeat 0% 0% / auto auto padding-box border-box scroll;
      	border: medium none currentColor;
      	border-radius: 0;
      	border-image: none;
      	opacity: 1;
      	text-align: inherit;
      	text-align-last: auto;
      	visibility: visible;
      }
    `)
  }

  resolve(root)
}))
