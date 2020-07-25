import AtRule from '../AtRule.js'

export default class MakeRule extends AtRule {
  get path () {
    return this.params[1]?.value ?? null
  }

  get theme () {
    return this.params[0]?.value ?? null
  }
}

// export default class Make extends AtRule {
//   constructor (atrule) {
//     super({
//       root: atrule,
//
//       format: 'themename[ outputpath]',
//
//       args: [
//         {
//           name: 'theme',
//           required: true,
//           types: ['word']
//         },
//
//         { types: ['space'] },
//
//         {
//           name: 'filepath',
//           types: ['string']
//         }
//       ]
//     })
//
//     this.theme = this.args.theme.value
//     this.filepath = this.args.hasOwnProperty('filepath') ? this.args.filepath.value : null
//   }
// }
