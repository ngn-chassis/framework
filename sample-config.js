const cfg = {
  // If no minWidth is specified, Chassis will default to 0.
  // If no maxWidth is specified
  layout: {
    minWidth: 320,
    maxWidth: 1920,
    gutter: '1em'
  },

  typography: false, // This will disable the Chassis Typography Engine

  typography: {
    baseFontSize: 14
  },

  viewport: {
    // Specify breakpoints:
    // Width Ranges automatically generated from these breakpoints:
    // below-min:    0 -  320,
    //       min:  320 -  512,
    //        xs:  512 -  768,
    //         s:  768 - 1024,
    //         m: 1024 - 1200,
    //         l: 1200 - 1440,
    //        xl: 1440 - 1600,
    //       max: 1600 - 1920,
    // above-max: 1920 - ^
    breakpoints: [320, 512, 768, 1024, 1200, 1440, 1600, 1920],

    // Or, specify Width Ranges manually:
    // Chassis will automatically generate:
    // below-small:    0 - 320
    // above-large: 1920 - ^
    widthRanges: [
      {
        name: 'small',
        bounds: {
          min: 320,
          max: 768
        }
      },

      {
        name: 'med',
        bounds: {
          min: 768,
          max: 1440
        }
      },

      {
        name: 'large',
        bounds: {
          min: 1440,
          max: 1920
        }
      }
    ],

    // Or, use the shorthand syntax:
    // Chassis will automatically generate:
    // below-min:    0 - 320
    // above-max: 1920 - ^
    widthRanges: '320 min 768 med 1440 max 1920'
  }
}
