export default `
  @component table {
    @selector table;

    @state initial {
      @default {
        table-layout: fixed;
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;

    		& th,
    		& td {
    			overflow: hidden;
    			text-align: left;
    			text-overflow: ellipsis;
    			vertical-align: top;
    		}

    		& caption {
    			text-align: left;
    		}
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
