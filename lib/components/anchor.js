export default `
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

      cursor: default;
      pointer-events: none;
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
