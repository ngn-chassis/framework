export default `@component button {
  @selector button, .button;
  @reset inline-block;
  @unset anchor;

  display: inline-flex;
  justify-content: center;
  align-items: center;
  line-height: var(--min-line-height);
  vertical-align: middle;
  user-select: none;
  cursor: pointer;
  font-family: unset;

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
    cursor: not-allowed;
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
}`
