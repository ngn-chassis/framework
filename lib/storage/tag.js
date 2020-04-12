export default `
  @component tag {
    @selector .tag;

    @state initial {
      @default {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        margin: 0;
        vertical-align: baseline;
      }
  	}

  	@state empty {
  		@selector &:empty;
  	}

  	@state focus-within {
  		@selector &:focus-within;
  	}
  }
`
