export default `
  @component test {
    @selector .test;
    @reset inline-block;

    cursor: pointer;
    user-select: none;

    @state hover {
      @selector &:hover, &.hover;
      background: yellow;

      @state disabled {
        background: red;

        @state visited {
          background: green;
        }
      }
    }

    @state disabled {
      @selector &:disabled, &.disabled;
      pointer-events: none;
    }

    @state visited {
      @selector &:visited;
      background: purple;
    }
  }
`
