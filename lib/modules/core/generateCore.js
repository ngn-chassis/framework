import Config from '../../data/Config.js'
import generateBrowserReset from './generateBrowserReset.js'
import generateCustomProperties from './generateCustomProperties.js'
import generateCustomMediaQueries from './generateCustomMediaQueries.js'
import generateGlobalModifiers from './generateGlobalModifiers.js'
import generateConstraints from './generateConstraints.js'
import generateTypographyRules from './generateTypographyRules.js'

export default function generateCore (cb) {
  return `
    @viewport {
      width: device-width;
    }

    /* Browser Reset */
    ${generateBrowserReset().trim()}

    /* Custom Properties */
    ${generateCustomProperties().trim()}

    ${generateCustomMediaQueries().trim()}

    /* Global Modifiers */
    ${generateGlobalModifiers().trim()}

    /* Constraints */
    ${generateConstraints().trim()}

    ${!Config.typography.disabled ? `
      /* Typography */
      ${generateTypographyRules(cb).trim()}
    `.trim() : ''}

    body {
      min-width: ${Config.layout.width.min}px;
      font-family: var(--font-family, initial);
      color: var(--text-color, initial);
    }

    /* User Styles */
  `.trim()
}
