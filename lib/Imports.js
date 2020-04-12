import generateComponents from './modules/components/generateComponents.js'
import generateCore from './modules/core/generateCore.js'

export default class Imports {
  static core (args, cb) {
    return generateCore(err => {
      if (err) {
        cb(ErrorUtils.createError({
          message: err
        }))
      }
    })
  }

  static components (args, cb) {
    return generateComponents(err => {
      if (err) {
        cb(ErrorUtils.createError({ message: err }))
      }
    })
  }
}
