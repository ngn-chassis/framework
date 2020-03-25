export default function globalModifiers () {
  return `
    /* Element visibility modifiers */
    .hidden {
      display: none !important;
    }

    .invisible {
      visibility: hidden !important;
    }

    .transparent {
      opacity: 0 !important;
    }

    /* Type Modifiers */
    .text-normal {
      font-weight: normal !important;
      font-style: normal !important;
      font-variant: normal !important;
      text-transform: none !important;
    }

    .text-bold {
      font-weight: bold !important;
    }

    .text-italic {
      font-style: italic !important;
    }

    .text-oblique {
      font-style: oblique !important;
    }

    .text-capitalize {
      text-transform: capitalize !important;
    }

    .text-small-caps {
      font-variant: small-caps !important;
    }

    .text-uppercase {
      text-transform: uppercase !important;
    }

    .text-lowercase {
      text-transform: lowercase !important;
    }

    .text-underline {
      text-decoration: underline !important;
    }

    .text-strikethrough {
      text-decoration: line-through !important;
    }

    .text-nowrap {
      white-space: nowrap !important;
    }

    .text-truncate {
      overflow: hidden !important;
    }

    .text-ellipsis {
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }
  `
}
