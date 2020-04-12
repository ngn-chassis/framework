import fs from 'fs-extra'
import path from 'path';
import { fileURLToPath } from 'url';

export default function generateComponents (cb) {
  return new Promise((resolve, reject) => {
    let componentsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../components')
    let queue = new NGN.Tasks()
    let output = ''

    queue.on('complete', () => resolve(output))

    fs.readdirSync(componentsDir).map(file => path.basename(file, '.js')).forEach(component => {
      queue.add(`Importing "${component}" component`, next => {
        let filepath = path.join(componentsDir, `${component}.js`)
        let err = [
          `Invalid built-in component ${filepath}`
        ]

        import(filepath).then(module => {
          output += module.default
          next()
        }).catch(err => {
          console.error(`  DEVELOPER ERROR in ${filepath}`)
          console.error(`  ${err}`)
        })
      })
    })

    queue.run(true)
  })
}
