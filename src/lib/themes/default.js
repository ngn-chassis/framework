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

      select {
        @set padding y left;
        padding-right: 2.236em;
        box-shadow: inset 0 0 0 1px lightgrey;
        border-radius: 3px;
        background: white;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-down'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right .618em top 50%;
        background-size: 1em auto;
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
