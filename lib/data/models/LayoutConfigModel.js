module.exports = new NGN.DATA.Model({
  autoid: false,

  fields: {
    // breakpoints: {
    //   type: String,
    //   default: '320 min 512 -2 768 -1 1024 mid 1200 +1 1440 +2 1600 max 1920'
    // },

    gutter: {
      type: String,
      default: '4.5vw',
      pattern: /^(auto|0)$|^[0-9]+.?([0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc|vw|vh|rem)$/gi
    },

    minWidth: {
      type: Number,
      default: 320,
      min: 0
    },

    maxWidth: {
      type: Number,
      default: 1920,
      min: 0
    }
  }
})
