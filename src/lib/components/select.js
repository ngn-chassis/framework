export default `@component select {
  @selector select;
  @reset inline-block;

  /* Reset */
  display: inline-flex;
  appearance: none;
  font-family: unset;
  font-size: unset;
  cursor: pointer;
  background: transparent;
  line-height: var(--min-line-height);

  @state hover {
    @selector &:hover, &.hover;
  }

  @state disabled {
    @selector &:disabled;
    pointer-events: none;
  }

  @state focus {
    @selector &:focus;
  }

  @state invalid {
    @selector &:invalid;
  }

  @state optional {
    @selector &:optional;
  }

  @state required {
    @selector &:required;
  }

  @state valid {
    @selector &:valid;
  }
}`
