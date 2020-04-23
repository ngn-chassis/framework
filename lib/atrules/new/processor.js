import NewRule from './NewRule.js'
import ComponentRule from '../component/ComponentRule.js'
import Component from '../component/Component.js'
import ComponentInstance from '../component/ComponentInstance.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class {
  static createComponentRule (base, instance) {
    let nodes = []

    if (base.reset) {
      nodes.push(CSSUtils.createAtRule({
        name: 'reset',
        params: base.reset
      }))
    }

    if (base.states.length > 0) {
      nodes.push(...base.states.map(state => {
        let nodes = []

        if (state.selector) {
          nodes.push(CSSUtils.createAtRule({
            name: 'selector',
            params: state.selector
          }))
        }

        return CSSUtils.createAtRule({
          name: 'state',
          params: state.name,
          nodes
        })
      }))
    }

    return new ComponentRule(CSSUtils.createAtRule({
      name: 'component',
      params: `${instance.name}`,
      nodes
    }))
  }

  static reconcileStates (base, instance) {
    return base.states.reduce((final, state) => {
      let instanceState = instance.states.find(instanceState => instanceState.name === state.name)

      if (instanceState) {
        final.push(instanceState)
      } else if (state.styles.length > 0) {
        final.push(state)
      }

      return final

    }, [])
  }

  static reconcileStyles (base, instance) {
    return [...base.styles, ...instance.styles].reduce((final, decl) => {
      let index = final.findIndex(storedDecl => storedDecl.prop === decl.prop)

      if (index >= 0) {
        final.splice(index, 1, decl)
      } else {
        final.push(decl)
      }

      return final
    }, [])
  }

  static process ({ atrule, stylesheet, resolve, reject }) {
    let { components } = stylesheet
    let instance = new NewRule(atrule)

    instance.validate(err => {
      if (err) {
        return reject(err)
      }

      let base = components.find(component => component.name === instance.component)
      let component = this.createComponentRule(base, instance)

      component.validate(err => {
        if (err) {
          return reject(err)
        }

        component = new Component(component, true)

        SelectorUtils.resolveSelector(atrule.parent, (err, selector) => {
          component.selector = selector
          component.reset = base.reset

          instance = new ComponentRule(CSSUtils.createAtRule({
            name: 'component',
            params: `${component.name} extends ${base.name}`,
            nodes: [
              CSSUtils.createAtRule({
                name: 'selector',
                params: component.selector
              }),

              ...atrule.nodes
            ]
          }))

          instance.validate(err => {
            if (err) {
              return reject(err)
            }

            let final = new ComponentInstance(base, instance, true)

            final.styles = this.reconcileStyles(base, final)
            final.states = this.reconcileStates(base, final)

            let root = CSSUtils.createRoot(final.styles)

            final.resolveStates(root, (err, result) => {
              if (err) {
                return reject(err)
              }

              stylesheet.components.push(final)

              atrule.replaceWith(result.toString())
              resolve()
            })
          })
        })
      })
    })
  }
}
