export default `
  @component checkbox {
    @selector input[type="checkbox"];

    @state hover {
      @selector &:hover, &.hover;
    }

    @state checked {
  		@selector &:checked;
  	}

    @state default {
  		@selector &:default;
  	}

    @state disabled {
      @selector &:disabled;
    }

    @state enabled {
  		@selector &:enabled;
  	}

    @state focus {
      @selector &:focus;
    }

    @state indeterminate {
  		@selector &:indeterminate;
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
  }
`
