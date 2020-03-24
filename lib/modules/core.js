import Config from '../data/Config.js'
import generateReset from './reset.js'
import generateCustomProperties from './custom-properties.js'
import generateCustomMediaQueries from './custom-media.js'

export default function generateCore () {
  return `
    @charset "${Config.charset}";

    /* hoist imports */

    @viewport {
      width: device-width;
    }

    ${generateReset()}

    ${generateCustomProperties()}

    ${generateCustomMediaQueries()}
  `.trim()
}
