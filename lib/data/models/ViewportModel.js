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
    settings: [new NGN.DATA.Model({
      autoid: false,

      fields: {
        selector: String,
        margin: Object,
        padding: Object,
        source: Object
      },

      relationships: {
        bounds: new NGN.DATA.Model({
          autoid: false,

          fields: {
            min: Number,
            max: Number
          }
        }),

        typeset: new NGN.DATA.Model({
          autoid: false,

          fields: {
            size: {
              type: Number,
              default: 0
            },

            sizeSet: {
              type: Boolean,
              default: false
            },

            relative: {
              type: Boolean,
              default: false
            }
          }
        })
      }
    })],

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
    })
  }
})
