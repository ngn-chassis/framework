export default `
  @component input {
    @selector input[type="date"],
              input[type="datetime-local"],
              input[type="email"],
              input[type="file"],
              input[type="month"],
              input[type="number"],
              input[type="password"],
              input[type="range"],
              input[type="search"],
              input[type="tel"],
              input[type="text"],
              input[type="time"],
              input[type="url"],
              input[type="week"];

    /* Reset */
    background: transparent;
    border: none;

  	@state hover {
  		@selector &:hover, &.hover;
  	}

  	@state active {
  		@selector &:active;
  	}

  	@state disabled {
  		@selector &:disabled;
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
  		@selector &:invalid;
  	}

  	@state in-range {
  		@selector &:in-range;
  	}

  	@state optional {
  		@selector &:optional;
  	}

  	@state out-of-range {
  		@selector &:out-of-range;
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
