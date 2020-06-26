export default `
  @component author-control {
    @selector author-control;

    & input,
		& textarea,
		& select,
		& datalist,
		& author-select,
		& author-datalist {
			width: 100%;
			max-width: 100%;
			margin: 0;
			vertical-align: top;
		}

    @state hover {
      @selector &:hover, &.hover;
    }

    @state default {
      @selector &:default;
    }

    @state defined {
      @selector &:defined;
    }

    @state disabled {
      @selector &.disabled;
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

    @state invalid {
      @selector &:invalid, &[invalid];
    }

    @state required {
      @selector &:required, &[required];
    }

    @state valid {
      @selector &:valid, &[valid];
    }
  }
`
