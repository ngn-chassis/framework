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

    @headings {
      h1 {
        @apply typeset +3;
        font-weight: bold;
      }

      h2 {
        @apply typeset +2;
        font-weight: bold;
      }

      h3 {
        @apply typeset +1;
        font-weight: bold;
      }

      h4 {
        @apply typeset;
        font-weight: bold;
      }

      h5 {
        @apply typeset -1;
        font-weight: bold;
      }

      h6 {
        @apply typeset -1;
        font-weight: bold;
      }

      legend {
        @apply typeset +1;
        font-weight: bold;
      }
    }

    @components {
      anchor {
        color: black;
        text-decoration: underline;
      }

      button {
        background: lightgrey;
        padding: .594392em 1.556em;
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
