import ComponentUtils from '../utilities/ComponentUtils.js'

// TODO: Add config option to flush all default styles

export default {
  get anchor () {
    return ComponentUtils.createComponent(`
      @component anchor {
        @selector a;
        @reset inline;

        @state link {
          @selector &:link;
        }

        @state visited {
          @selector &:visited;
        }

        @state hover {
          @selector &:hover, &.hover;
        }

        @state active {
          @selector &:active;
        }

        @state disabled {
          @selector &:disabled;

          pointer-events: none;
          cursor: not-allowed;
        }

        @state empty {
          @selector &:empty;
        }

        @state enabled {
          @selector &:enabled;
        }

        @state focus {
          @selector &:focus;
        }

        @state focus-within {
          @selector &:focus-within;
        }
      }
    `)
  },

  get button () {
    return ComponentUtils.createComponent(`
      @component button {
        @selector button;
        @reset inline-block;
        @unset anchor;

        display: inline-flex;
        justify-content: center;
        align-items: center;
        vertical-align: baseline;
        user-select: none;
        cursor: pointer;

        @state visited {
          @selector &:visited;
        }

        @state hover {
          @selector &:hover, &.hover;
        }

        @state active {
          @selector &:active;
        }

        @state default {
          @selector &:default;
        }

        @state disabled {
          @selector &:disabled, &.disabled;

          pointer-events: none;
          cursor: not-allowed;
        }

        @state empty {
          @selector &:empty;
        }

        @state enabled {
          @selector &:enabled;
        }

        @state focus {
          @selector &:focus;
        }

        @state focus-within {
          @selector &:focus-within;
        }
      }
    `)
  },

  get tag () {
    return ComponentUtils.createComponent(`
      @component tag {
        @selector .tag;

        display: inline-flex;
        justify-content: center;
        align-items: center;
        vertical-align: baseline;

        @state empty {
          @selector &:empty;
        }

        @state focus-within {
          @selector &:focus-within;
        }
      }
    `)
  }
}
