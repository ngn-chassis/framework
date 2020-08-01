export default `
  @component author-icon {
    @selector author-icon;
    @reset inline-block;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    & svg {
      flex: 1 1 auto;
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    @state hover {
      @selector &:hover, &.hover;
    }
  }
`
