export default `
  @component button {
    @selector button, .button;
    @reset inline-block;

    @state initial {
      user-select: none;
      cursor: pointer;
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
      @selector &:disabled, &.disabled;
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
