const Defaults = require('../Defaults.js')
const Constants = require('../Constants.js')

module.exports = new NGN.DATA.Model({
  autoid: false,

  fields: {
    disabled: {
      type: Boolean,
      default: false
    }
  },

  relationships: {
    constraints: new NGN.DATA.Model({
      autoid: false,

      relationships: {
        height: new NGN.DATA.Model({
          autoid: false,

          fields: {
            min: {
              type: Number,
              default: Defaults.layout.constraints.height.min,
              min: 0
            },

            max: {
              type: Number,
              default: null,
              min: 0
            }
          }
        }),

        width: new NGN.DATA.Model({
          autoid: false,

          fields: {
            min: {
              type: Number,
              default: Defaults.layout.constraints.width.min,
              min: 0
            },

            max: {
              type: Number,
              default: Defaults.layout.constraints.width.max,
              min: 0,
              max: Constants.layout.maxWidth
            }
          }
        })
      }
    }),

    gutter: new NGN.DATA.Model({
      autoid: false,

      fields: {
        x: {
          type: String,
          default: Defaults.layout.gutter.x,
          pattern: /^(auto|0)$|^[0-9]+.?([0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc|vw|vh|rem)$/gi
        },

        y: {
          type: String,
          default: Defaults.layout.gutter.y,
          pattern: /^(auto|0)$|^[0-9]+.?([0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc|vw|vh|rem)$/gi
        }
      },

      virtuals: {
        gutterLimitX () {
          console.log('heyyy');
          return '1em'
        }
      }
    })
  }
})
