import postcss from 'postcss'
import parser from 'postcss-scss'
import Constants from '../data/Constants.js'
import CSSUtils from '../utilities/CSSUtils.js'

export default postcss.plugin('chassis-reset', block => {
  return (root, result) => new Promise((resolve, reject) => {
    root.prepend(parser.parse(`/* Browser Reset ***************************************************************/

*, *:before, *:after {
  box-sizing: border-box;
}

html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p,
blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img,
ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center,
dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody,
tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure,
figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font: inherit;
  font-size: 100%;
  vertical-align: baseline;
}

ol, ul {
  list-style: none;
}

q, blockquote {
  quotes: none;
}

q:before, q:after,
blockquote:before, blockquote:after {
  content: '';
  content: none;
}

a img {
  border: none;
}

${Constants.layout.blockElements.join(', ')} {
  display: block;
}

input, textarea, button {
  font-size: inherit;
}`, { from: 'chassis.reset' }))

    resolve(root)
  })
})
