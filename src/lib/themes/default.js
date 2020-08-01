import parser from 'postcss-scss'
import ThemeRule from '../atrules/theme/ThemeRule.js'
import Theme from '../atrules/theme/Theme.js'

const raw = parser.parse(`
  @theme default {
    @properties {
      --root-bg-color: white;
      --text-color: rgb(59,59,59);
      --font-family: system-ui;
    }

    @headings {
      h1 {
        font-weight: bold;
      }

      h2 {
        font-weight: bold;
      }

      h3 {
        font-weight: bold;
      }

      h4 {
        font-weight: bold;
      }

      h5 {
        font-weight: bold;
      }

      h6 {
        font-weight: bold;
      }

      legend {
        font-weight: bold;
      }
    }

    @components {
      anchor {
        color: black;
        text-decoration: underline;
      }

      button {
        @set padding;
        background: lightgrey;
        border-radius: 3px;
      }

      table {
        table-layout: fixed;
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;

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
`, { from: 'default theme' }).nodes[0]

export default new Theme(new ThemeRule(raw))
