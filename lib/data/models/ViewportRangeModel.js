import Defaults from '../Defaults.js'

function compare (value, comparator, condition) {
  return value
    ? comparator ? condition : true
    : true
}

function compareMin (value, comparator) {
  return compare(value, comparator, value < comparator)
}

function compareMax (value, comparator) {
  return compare(value, comparator, value > comparator)
}

export default new NGN.DATA.Model({
  autoid: false,

  fields: {
    name: {
      type: String,
      default: null
    },

    fontSize: {
      type: Number,
      default: null
    },

    orientation: {
      type: String,
      default: null
    },

    columns: {
      type: Number,
      default: 1
    }
  },

  relationships: {
    width: new NGN.DATA.Model({
      autoid: false,

      fields: {
        min: {
          type: Number,

          validate (value) {
            return compareMin(value, this.width.max)
          }
        },

        max: {
          type: Number,

          validate (value) {
            return compareMax(value, this.width.min)
          }
        }
      }
    }),

    height: new NGN.DATA.Model({
      autoid: false,

      fields: {
        min: {
          type: Number,

          validate (value) {
            return compareMin(value, this.width.max)
          }
        },

        max: {
          type: Number,

          validate (value) {
            return compareMax(value, this.height.min)
          }
        }
      }
    })
  }
})
