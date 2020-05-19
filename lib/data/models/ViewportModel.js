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

    type: {
      type: String,
      default: 'range'
    },

    fontSize: {
      type: Number,
      default: null
    },

    columns: {
      type: Number,
      default: null
    }
  },

  relationships: {
    bounds: new NGN.DATA.Model({
      autoid: false,

      fields: {
        min: {
          type: Number,
          required: true,

          validate (value) {
            return compareMin(value, this.bounds.max)
          }
        },

        max: {
          type: Number,

          validate (value) {
            return compareMax(value, this.bounds.min)
          }
        }
      }
    }),

    typesets: [new NGN.DATA.Model({
      autoid: false,

      fields: {
        selector: String,
        increment: {
          type: Number,
          default: 0
        }
      },

      relationships: {
        bounds: new NGN.DATA.Model({
          autoid: false,

          fields: {
            min: Number,
            max: Number
          }
        })
      }
    })]
  }
})
