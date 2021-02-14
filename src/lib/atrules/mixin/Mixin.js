import AtRule from './AtRule.js'
// import ErrorUtils from './utilities/ErrorUtils.js'

export default class Mixin extends AtRule {
  // process (cb) {
  //   AtRules[this.name](this, (err, output) => {
  //     if (err) {
  //       cb(ErrorUtils.createError(Object.assign({}, this.source, {
  //         atRule: this.name,
  //         message: err
  //       })))
  //     }
  //
  //     cb(null, output)
  //   })
  // }

  // resolve (cb) {
  //   // if (!this.isValid) {
  //   //   cb(ErrorUtils.createError(Object.assign({}, this.source, {
  //   //     message: `Invalid AtRule "@${this.name}"`
  //   //   })))
  //   // }
  //
  //   this.process((err, output) => {
  //     if (err) {
  //       return cb(err)
  //     }
  //
  //     this.css.replaceWith(output)
  //     cb()
  //   })
  // }
}
