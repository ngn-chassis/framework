export default `
  @component tag {
    @selector .tag;
    @reset inline;

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
`
