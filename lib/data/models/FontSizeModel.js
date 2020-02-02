const FontSizeModel = new NGN.DATA.Model({
  fields: {
    headings: {
      type: Object,
      default: {
        '1': 'larger',
        '2': 'large',
        '3': 'root',
        '4': 'small',
        '5': 'small',
        '6': 'small'
      },

      validate (data) {
        let mh = new MustHave()

        if (!mh.hasExactly(data, '1', '2', '3', '4', '5', '6')) {
          return false
        }

        return Object.keys(data).every(key => {
          return typeof data[key] === 'string'
        })
      }
    },

    formLegend: {
      type: String,
      default: 'large'
    }
  }
})

module.exports = FontSizeModel
