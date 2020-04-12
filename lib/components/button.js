export default `
  @component button {
    @selector button, .button;

    @state initial {
      @default {
        user-select: none;
      }
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

    @state default {
      @selector &:default;
    }

    @state disabled {
      @selector &:disabled;

      @default {
        pointer-events: none;
      }
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
`
