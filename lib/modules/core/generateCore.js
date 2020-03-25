import Config from '../../data/Config.js'
import generateBrowserReset from './generateBrowserReset.js'
import generateCustomProperties from './generateCustomProperties.js'
import generateCustomMediaQueries from './generateCustomMediaQueries.js'
import generateGlobalModifiers from './generateGlobalModifiers.js'
import generateConstraints from './generateConstraints.js'
import generateTypographyRules from './generateTypographyRules.js'

export default function generateCore () {
  return `
    @charset "${Config.charset}";

    /* hoist imports */

    @viewport {
      width: device-width;
    }

    /* Browser Reset */
    ${generateBrowserReset().trim()}

    /* Custom Properties */
    ${generateCustomProperties().trim()}

    /* Custom Media */
    ${generateCustomMediaQueries().trim()}

    /* Global Modifiers */
    ${generateGlobalModifiers().trim()}

    /* Constraints */
    ${generateConstraints().trim()}

    ${!Config.typography.disabled ? `
      /* Typography */
      ${generateTypographyRules().trim()}
    `.trim() : ''}

    /* User Styles */
  `.trim()
}
