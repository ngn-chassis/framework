let postcss = require('postcss')
let env = require('postcss-preset-env')

// const mergeAdjacentRules = require('postcss-merge-rules')
let removeComments = require('postcss-discard-comments')
let perfectionist = require('perfectionist')
let CleanCss = require('clean-css')
let nesting = require('postcss-nesting')
let processNot = require('postcss-selector-not')
let valueParser = require('postcss-value-parser')

module.exports = (function () {
	let _ = new WeakMap()

	return class extends NGN.EventEmitter {
		constructor (chassis, raw, namespaced = true) {
			super()

			this.tree = postcss.parse(raw)

			_.set(this, {
				chassis,
				atRules: {},
				namespaced,

				generateNamespacedSelector: selector => {
					if (selector.includes('html')) {
						selector = `${selector.trim()}.chassis`
					} else if (selector === ':root') {
						selector = selector.trim()
					} else {
						selector = `.chassis ${selector.trim()}`
					}

					if (selector.includes(',')) {
						selector = selector.split(',').map(chunk => chunk.trim()).join(', .chassis ')
					}

					return selector
				},

				namespaceSelectors: () => {
					this.tree.walkRules(rule => {
						// Cleanup empty rulesets
						if (rule.nodes.length === 0) {
							rule.remove()
							return
						}

						if (rule.parent && rule.parent.type === 'atrule' && rule.parent.name === 'keyframes') {
							return
						}

						if (namespaced) {
							rule.selector = _.get(this).generateNamespacedSelector(rule.selector)
						}
					})
				},

				processAtRule: (atRule, cb) => {
					let data = Object.assign({
						root: this.tree,
						atRule
					}, chassis.atRules.getProperties(atRule))

					chassis.atRules.process(data)
				},

				processAtRules: type => {
					if (_.get(this).atRules.hasOwnProperty(type) && _.get(this).atRules[type].length > 0) {
						_.get(this).atRules[type].forEach(atRule => {
							_.get(this).processAtRule(atRule)
						})

						delete _.get(this).atRules[type]
					}
				},

				processFunctions: type => {
					this.tree.walkDecls(decl => {
						let parsed = valueParser(decl.value)

						if (parsed.nodes.some(node => node.type === 'function')) {
							decl.value = chassis.functions.process({
								root: this.tree,
								raw: decl,
								parsed
							})
						}
					})
				},

				processImport: (atRule) => {
					if (atRule.params.startsWith('import')) {
						_.get(this).processAtRule(atRule)
					}
				},

				processImports: () => {
					let {
						processImport,
						processImports
					} = _.get(this)

					this.tree.walkAtRules('chassis', atRule => processImport(atRule))

					this.tree.walkAtRules(atRule => {
						if (atRule.params.includes('import')) {
							processImports()
						}
					})
				},

				processMixins: () => {
					let {
						processAtRules,
						processMixins,
						storeAtRules
					} = _.get(this)

					storeAtRules()

					if (Object.keys(_.get(this).atRules).length === 0) {
						return
					}

					// Process all but 'include', 'new' and 'extend' mixins as those need to be
					// processed after the unnest operation to properly resolve nested selectors
					processAtRules('other')

					// Process remaining 'new', 'extend', and 'include' mixins
					processAtRules('new')
					processAtRules('extend')
					processAtRules('include')

					// Recurse to handle any mixins brought in via include
					processMixins()
				},

				processNesting: () => {
					this.tree = postcss.parse(nesting.process(this.tree))
				},

				processNot: () => {
					this.tree = postcss.parse(processNot.process(this.tree))
				},

				storeAtRule: atRule => {
					let params = atRule.params.split(' ')
					let container = params[0]
					let containers = ['import', 'include', 'new', 'extend']

					if (containers.includes(container)) {
						if (!_.get(this).atRules.hasOwnProperty(container)) {
							_.get(this).atRules[container] = []
						}

						_.get(this).atRules[container].push(atRule)
						return
					}

					if (!_.get(this).atRules.hasOwnProperty('other')) {
						_.get(this).atRules.other = []
					}

					_.get(this).atRules.other.push(atRule)
				},

				storeAtRules: () => {
					_.get(this).atRules = {}
					this.tree.walkAtRules('chassis', atRule => _.get(this).storeAtRule(atRule))
				}
			})
		}

		get isInitialized () {
			return this.tree.some(node => {
				return node.type === 'atrule' && node.name === 'chassis' && node.params === 'init'
			})
		}

		// TODO: Account for multiple "include" mixins
		process (filepath) {
			let {
				chassis,
				generateNamespacedSelector,
				namespaced,
				namespaceSelectors,
				processImports,
				processNesting,
				processAtRules,
				processMixins,
				processNot,
				processFunctions,
				storeAtRules
			} = _.get(this)

			let {
				atRules,
				core,
				post,
				settings,
				utils
			} = chassis

			let tasks = new NGN.Tasks()
			let sourceMap

			tasks.add('Processing Imports', next => {
				processImports()
				processNesting()
				next()
			})

			tasks.add('Processing Mixins', next => {
				processMixins()
				processNot()
				processNesting()

				next()
			})

			tasks.add('Processing Functions', next => {
				processFunctions()
				next()
			})

			tasks.add('Namespacing Selectors', next => {
				namespaceSelectors()
				next()
			})

			if (this.isInitialized) {
				tasks.add('Initializing Typography Engine', next => {
					this.tree = core.css.append(this.tree)
					next()
				})
			}

			tasks.add('Running post-processing routines', next => {
				this.tree.walkAtRules('chassis-post', atRule => {
  				let data = Object.assign({
  					root: this.tree,
  					atRule
  				}, atRules.getProperties(atRule))

  				post.process(data)
  			})

  			next()
			})

			tasks.add('Processing CSS4 Syntax', next => {
				env.process(this.tree, {from: filepath}, settings.envCfg).then(processed => {
					// console.log(processed.messages);
					// TODO: Check processed for errors here
          this.tree = processed.root
          next()
        }, () => {
					this.emit('processing.error', new Error('Error Processing CSS4 Syntax'))
				})
			})

			// tasks.add('Merging matching adjacent rules...', next => {
  		// 	output = mergeAdjacentRules.process(output.toString())
  		// 	next()
  		// })

			tasks.add('Beautifying Output', next => {
				removeComments.process(this.tree).then(result => {
					perfectionist.process(result.css).then(result => {
						this.tree = result.root

						// Remove empty rulesets
						this.tree.walkRules(rule => {
							if (rule.nodes.length === 0) {
								rule.remove()
								return
							}
						})

						next()
					}, () => {
						this.emit('processing.error', new Error('Error Beautifying Output'))
					})
				}, () => {
					this.emit('processing.error', new Error('Error Removing Comments'))
				})
			})

			if (settings.minify) {
				let minified

				tasks.add('Minifying Output', next => {
					minified = new CleanCss({
						sourceMap: settings.sourceMap
					}).minify(this.tree.toString())

					this.tree = minified.styles
					next()
				})

				if (settings.sourceMap) {
					tasks.add('Generating source map', next => {
						sourceMap = minified.sourceMap.toString()
						next()
					})
				}
			}

			// tasks.on('taskstart', evt => console.log(`${evt.name}...`))
			// tasks.on('taskcomplete', evt => console.log('Done.'))

			tasks.on('complete', () => this.emit('processing.complete', {
				css: this.tree.toString(),
				sourceMap
			}))

			this.emit('processing')
			tasks.run(true)
		}
	}
})()
