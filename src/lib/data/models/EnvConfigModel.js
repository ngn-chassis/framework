export default new NGN.DATA.Model({
  autoid: false,

  fields: {
    stage: {
      type: Number,
      default: 0
    },

    'custom-properties': false
  },

  relationships: {
    features: new NGN.DATA.Model({
      autoid: false,

      relationships: {
        // 'custom-properties': new NGN.DATA.Model({
        //   autoid: false,
        //
        //   fields: {
        //     preserve: true
        //   }
        // }),

        'color-mod-function': new NGN.DATA.Model({
          autoid: false,

          fields: {
            unresolved: {
              type: String,
              default: 'warn'
            }
          }
        })
      }
    })
  }
})
