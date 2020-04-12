export default `
  @component textarea {
    @selector textarea;

    @state initial {
      @default {
        overflow: auto;

        /* Reset */
        vertical-align: top;
        resize: vertical;

        background: transparent;
        border: none;
      }
  	}

  	@state hover {
  		@selector &:hover, &.hover;
  	}

  	@state active {
  		@selector &:active;
  	}

  	@state disabled {
  		@selector &:disabled;

      @default {
        pointer-events: none;
      }
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
  		@selector &:invalid;
  	}

  	@state optional {
  		@selector &:optional;
  	}

  	@state read-only {
  		@selector &:read-only;
  	}

  	@state read-write {
  		@selector &:read-write;
  	}

  	@state required {
  		@selector &:required;
  	}

  	@state valid {
      @selector &:valid;
    }
  }
`
