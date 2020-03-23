export default {
  apply: atRule => {
    console.log('call apply');
  },

  constrain: atRule => {
    console.log('call constrain')
  },

  import: atRule => {
    console.log('call import')
  }
}
