export default `
  @component button {
    @selector button;
    @reset inline-block;
    @unset anchor;

    cursor: pointer;
    user-select: none;

    @state hover {
      @selector &:hover, &.hover;
    }

    @state disabled {
      @selector &:disabled, &.disabled;
      pointer-events: none;
    }
  }

  @component test extends button {
    @selector &.test;
  }
`
