import postcss from 'postcss'
import parser from 'postcss-scss'

import ThemeRule from '../atrules/theme/ThemeRule.js'
import Theme from '../atrules/theme/Theme.js'

import CSSUtils from '../utilities/CSSUtils.js'

const raw = parser.parse(`
  @theme default {
    @properties {
      --root-bg-color: white;
      --text-color: rgb(59,59,59);
      --font-family: system-ui;
    }

    @components {
      anchor {
        color: black;
        text-decoration: underline;
      }

      button {
        background: lightgrey;
        padding: .618em 1em;
        border-radius: 3px;
      }

      table {
        table-layout: fixed;
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0l

        & th,
        & td {
          overflow: hidden;
          text-align: left;
          text-overflow: ellipsis;
          vertical-align: top;
        }

        & caption {
          text-align: left;
        }
      }
    }
  }
`, { from: void 0 }).nodes[0]

export default new Theme(new ThemeRule(raw))

// export default {
//   name: 'default',
//
//   properties: [
//     CSSUtils.createDeclObj('--root-bg-color', 'white'),
//     CSSUtils.createDeclObj('--text-color', 'rgb(59,59,59)')
//   ],
//
//   components: {
//     anchor: {
//       styles: [
//         CSSUtils.createDeclObj('color', 'black'),
//         CSSUtils.createDeclObj('text-decoration', 'underline')
//       ]
//     },
//
//     button: {
//       styles: [
//         CSSUtils.createDeclObj('background', 'lightgrey')
//       ]
//     },
//
//     table: {
//       styles: [
//         CSSUtils.createDeclObj('table-layout', 'fixed'),
//         CSSUtils.createDeclObj('width', '100%'),
//         CSSUtils.createDeclObj('border-collapse', 'collapse'),
//         CSSUtils.createDeclObj('border-spacing', '0'),
//
//         CSSUtils.createRule('& th, & td', [
//           CSSUtils.createDeclObj('overflow', 'hidden'),
//           CSSUtils.createDeclObj('text-align', 'left'),
//           CSSUtils.createDeclObj('text-overflow', 'ellipsis'),
//           CSSUtils.createDeclObj('vertical-align', 'top')
//         ]),
//
//         CSSUtils.createRule('& caption', [
//           CSSUtils.createDeclObj('text-align', 'left')
//         ])
//       ],
//
//       states: {
//         empty: [],
//         'focus-within': []
//       }
//     }
//   }
// }
