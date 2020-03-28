import Config from '../data/Config.js'
import CSSUtils from '../utilities/CSSUtils.js'
import ErrorUtils from '../utilities/ErrorUtils.js'
import ViewportUtils from '../utilities/ViewportUtils.js'

export default class {
  static argIsApplicable (arg) {
    return arg.type === 'function' && arg.nodes.some(node => {
      let { value } = node
      return node.type === 'word' && !isNaN(value) && (value.startsWith('+') || value.startsWith('-') || value.startsWith('+-'))
    })
  }

  static getModifiers (func, cb) {
    return func.nodes.reduce((acc, modifier) => {
      if (isNaN(modifier) || !['word', 'string'].some(type => modifier.type === type)) {
        return acc
      }

      let adjustment = parseInt(modifier.value)

      if (isNaN(adjustment)) {
        return cb([
          `Invalid modifier "${modifier.toString()}". Modifier must be a number prefixed with "+" or "-".`,
          `Ex) +200 | -200 | +-200`
        ])
      }

      acc.push(adjustment)
      return acc
    }, [])
  }

  static getRanges (functions, cb) {
    return functions.map(func => {
      let { generatedRanges } = Config
      let rangeName = func.nodes[0].value
      let range = generatedRanges.find(range => range.name === rangeName.slice(2))

      // if (!range) {
      //   return cb([
      //     `Invalid viewport range "${rangeName}". Available viewport ranges:`,
      //     ...generatedRanges.map(range => {
      //       let { min, max } = range.bounds
      //       return `  --${range.name} (${min ? `min: ${min}` : ''}${max ? `  max: ${max}` : ''})`
      //     })
      //   ])
      // }

      return this.applyModifiers(this.getModifiers(func, cb), range)
    })
  }

  static applyModifiers (modifiers, range) {
    modifiers.forEach(adj => {
      if (adj === 0) {
        return
      }

      if (!range.bounds.min) {
        range.bounds.max += adj
      } else if (!range.bounds.max) {
        range.bounds.min += adj
      } else if (adj < 0) {
        range.bounds.min += adj
      } else if (adj > 0) {
        range.bounds.max += adj
      }
    })

    return range
  }

  static getBound (bound, ranges) {
    return NGN.coalesce(Math[bound](...ranges.map(range => {
      return range.bounds[bound]
    }).filter(bound => !isNaN(bound))))
  }

  static coalesceBounds (ranges) {
    if (ranges.length === 1) {
      return ranges[0].bounds
    }

    return {
      min: this.getBound('min', ranges),
      max: this.getBound('max', ranges)
    }
  }

  static createQuery (ranges, remainingArgs, nodes, cb) {
    let type = ranges[0].type
    let bounds = this.coalesceBounds(ranges)

    if (bounds.min >= bounds.max) {
      return cb([
        `Invalid media query. Maximum bound must be greater than minimum bound.`,
        `min: ${bounds.min}`,
        `max: ${bounds.max}`
      ])
    }

    let query = ViewportUtils.generateQuery({ bounds, type }, nodes)

    query.params += remainingArgs.reduce((string, arg) => {
      string += ` and ${arg.toString()}`
      return string
    }, '')

    cb(null, query)
  }

  static process (atRule, cb) {
    let remainingArgs = []

    let functions = atRule.args.filter(arg => {
      let match = this.argIsApplicable(arg)

      if (!match && arg.value !== 'and') {
        remainingArgs.push(arg)
      }

      return match
    })

    if (functions.length === 0) {
      return cb(null, null, false)
    }

    let ranges = this.getRanges(functions, cb)

    if (ranges.length === 0) {
      return cb(null, null, false)
    }

    if (ranges.every(range => range.type === ranges[0].type)) {
      return this.createQuery(ranges, remainingArgs, atRule.nodes, cb)
    }

    cb(null, null, false)
  }
}
