export default `
  @component progress {
    @selector progress;

    @state initial {}

  	@state hover {
  		@selector &:hover, &.hover;
  	}

  	@state disabled {
  		@selector &:disabled;
  	}

  	@state empty {
  		@selector &:empty;
  	}

  	@state enabled {
  		@selector &:enabled;
  	}

  	@state indeterminate {
  		@selector &:indeterminate;
  	}
  }
`
