import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'

export default function generateComponents (components, cb) {
  let root = CSSUtils.createRoot()
  root.append(`/* Components ******************************************************************/`)

  QueueUtils.run({
    pad: {
      start: '        '
    },

    tasks: Object.keys(components).reduce((tasks, name) => {
      let component = components[name]

      if (component.inline) {
        return tasks
      }

      tasks.push({
        name: `Generating ${component.name} CSS`,
        callback: next => component.resolve((err, result) => {
          root.append(result)
          next()
        })
      })

      return tasks
    }, [])
  })
  .then(() => cb(null, root))
  .catch(cb)
}
