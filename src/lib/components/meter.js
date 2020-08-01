export default `
  @component meter {
    @selector meter;

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
  }
`
