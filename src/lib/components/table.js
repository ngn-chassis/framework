export default `@component table {
  @selector table;

  @state empty {
    @selector &:empty;
  }

  @state focus-within {
    @selector &:focus-within;
  }
}`
