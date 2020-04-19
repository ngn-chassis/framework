export default `
  @theme default {
    properties {
      --root-bg-color: white;
      --text-color: rgb(59,59,59);
    }

    components {
      button {
        @state initial {
          background: grey;
          color: white;
        }
      }
    }
  }

  @make default;
`
