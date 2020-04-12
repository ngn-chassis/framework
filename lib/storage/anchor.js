export default `
  @component anchor {
    @selector a;

    @state initial {}

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

      @default {
        cursor: default;
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
