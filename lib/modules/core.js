import Config from '../data/Config.js'

import CSSUtils from '../utilities/CSSUtils.js'
import LayoutUtils from '../utilities/LayoutUtils.js'
import QueueUtils from '../utilities/QueueUtils.js'
import TypographyUtils from '../utilities/TypographyUtils.js'
import ViewportUtils from '../utilities/ViewportUtils.js'

import parseValue from 'postcss-value-parser'

export default {
  charset ({ charset }) {
    return `@charset "${charset}";`
  },

  hoist ({ nodes }) {
    let root = CSSUtils.createRoot()
    nodes.forEach(node => root.append(node))
    return root
  },

  viewport ({ width }) {
    return CSSUtils.createAtRule({
      name: 'viewport',
      nodes: [
        CSSUtils.createDecl('width', width)
      ]
    })
  },

  reset ({ block, theme }) {
    let headings = !!theme.headings
      ? CSSUtils.createRule(theme.headings.map(heading => heading.name).join(', '), theme.sharedHeadingStyles)
      : ''

    return `
      /* Browser Reset ***************************************************************/

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

      ${block.join(', ')} {
        display: block;
      }

      input, textarea, button {
        font-size: inherit;
      }

      ${headings.toString()}
    `
  },

  'custom-properties' ({ theme }) {
    let { width, gutter } = Config.layout

    return `
      /* Custom Properties ***********************************************************/

      :root {
        ${theme.properties.reduce((output, property) => {
          return output += `${property.prop}: ${property.value};\n`
        }, '')}

        --layout-width-min: ${width.min}px;
        --layout-width: ${width.max - width.min}px;
      	--layout-width-max: ${width.max}px;
      	--layout-gutter-x: ${gutter.x};
      	--layout-gutter-x-min: ${LayoutUtils.minGutterXWidth};
      	--layout-gutter-x-max: ${LayoutUtils.maxGutterXWidth};

        --base-font-size: ${Config.typography.baseFontSize};
      	--scale-ratio: ${Config.typography.scaleRatio};
        --min-line-height: ${TypographyUtils.minLineHeight};

      	/* --block-margin-y: $(block-margin-y); */

      	/* --inline-block-margin-x: 1em; */
      	/* --inline-block-margin-y: $(inline-block-margin-y); */
      	/* --inline-block-padding-x: $(inline-block-padding-x); */
      	/* --inline-block-padding-y: $(inline-block-padding-y); */

      	/* --pill-padding-x: $(pill-padding-x); */
      	/* --pill-border-radius: $(pill-border-radius); */

      	/* Copic Greys */
      	/* Cool greys */
      	--grey-c00 : rgb(232,240,243);
      	--grey-c01 : rgb(225,233,236);
      	--grey-c02 : rgb(218,227,232);
      	--grey-c03 : rgb(204,215,221);
      	--grey-c04 : rgb(192,203,209);
      	--grey-c05 : rgb(146,160,169);
      	--grey-c06 : rgb(125,139,150);
      	--grey-c07 : rgb(99,112,121);
      	--grey-c08 : rgb(83,93,103);
      	--grey-c09 : rgb(60,71,77);
      	--grey-c10 : rgb(33,42,49);

      	/* Neutral greys */
      	--grey-n00 : rgb(237,237,237);
      	--grey-n01 : rgb(226,227,229);
      	--grey-n02 : rgb(218,219,221);
      	--grey-n03 : rgb(209,210,212);
      	--grey-n04 : rgb(188,189,193);
      	--grey-n05 : rgb(169,170,174);
      	--grey-n06 : rgb(148,149,153);
      	--grey-n07 : rgb(119,120,124);
      	--grey-n08 : rgb(99,100,102);
      	--grey-n09 : rgb(76,77,79);
      	--grey-n10 : rgb(44,45,48);

      	/* Toner greys */
      	--grey-t00 : rgb(237,237,237);
      	--grey-t01 : rgb(234,234,234);
      	--grey-t02 : rgb(225,225,223);
      	--grey-t03 : rgb(211,212,207);
      	--grey-t04 : rgb(188,187,185);
      	--grey-t05 : rgb(168,167,163);
      	--grey-t06 : rgb(147,147,145);
      	--grey-t07 : rgb(117,118,119);
      	--grey-t08 : rgb(99,99,97);
      	--grey-t09 : rgb(76,75,73);
      	--grey-t10 : rgb(51,47,46);
      }
    `
  },

  'custom-media' ({ viewports }) {
    let root = CSSUtils.createRoot([])

    viewports.forEach(viewport => root.append(ViewportUtils.generateCustomMedia(viewport)))

    return `
      /* Custom Media ****************************************************************/

      ${root.toString()};
    `
  },

  modifiers ({ custom }) {
    return `
      /* Global Modifiers ************************************************************/

      /* Element visibility modifiers */
      .hidden {
        display: none !important;
      }

      .invisible {
        visibility: hidden !important;
      }

      .transparent {
        opacity: 0 !important;
      }

      /* Type Modifiers */
      .text-normal {
        font-weight: normal !important;
        font-style: normal !important;
        font-variant: normal !important;
        text-transform: none !important;
      }

      .text-bold {
        font-weight: bold !important;
      }

      .text-italic {
        font-style: italic !important;
      }

      .text-oblique {
        font-style: oblique !important;
      }

      .text-capitalize {
        text-transform: capitalize !important;
      }

      .text-small-caps {
        font-variant: small-caps !important;
      }

      .text-uppercase {
        text-transform: uppercase !important;
      }

      .text-lowercase {
        text-transform: lowercase !important;
      }

      .text-underline {
        text-decoration: underline !important;
      }

      .text-strikethrough {
        text-decoration: line-through !important;
      }

      .text-nowrap {
        white-space: nowrap !important;
      }

      .text-truncate {
        overflow: hidden !important;
      }

      .text-ellipsis {
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
    `
  },

  constraints () {
    let { gutter, width, height, minGutterXWidth, maxGutterXWidth } = LayoutUtils

    let root = CSSUtils.createRoot([])

    root.append(`
      /* Constraints *****************************************************************/

      .height.constraint {
        min-height: ${NGN.coalesce(height.min, 0)}px;
        max-height: ${height.max ? `${height.max}px` : 'initial'};
      }

      .min.height.constraint {
        max-height: initial;
      }

      .max.height.constraint {
        min-height: initial;
      }

      .width.constraint {
        width: 100%;
        min-width: ${width.min}px;
        max-width: ${width.max}px;
        margin-left: auto;
        margin-right: auto;
        padding-left: ${gutter.x};
        padding-right: ${gutter.x};
      }

      .min.width.constraint {
        max-width: initial;
      }

      .max.width.constraint {
        min-width: initial;
      }
    `)

    if (['vw', '%'].includes(parseValue.unit(gutter.x).unit)) {
      root.append(`
        @media screen and (max-width: ${width.min}px) {
          .width.constraint {
            padding-left: ${minGutterXWidth};
            padding-right: ${minGutterXWidth};
          }

          .max.width.constraint {
            padding-left: initial;
            padding-right: initial
          }
        }

        @media screen and (min-width: ${width.max}px) {
          .width.constraint {
            padding-left: ${maxGutterXWidth};
            padding-right: ${maxGutterXWidth};
          }

          .min.width.constraint {
            padding-left: initial;
            padding-right: initial
          }
        }
      `)
    }

    return root.toString()
  }
}
