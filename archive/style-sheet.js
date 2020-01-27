let postcss = require('postcss')
let env = require('postcss-preset-env')

// const mergeAdjacentRules = require('postcss-merge-rules')
let removeComments = require('postcss-discard-comments')
let perfectionist = require('perfectionist')
let CleanCss = require('clean-css')
let nesting = require('postcss-nesting')
let processNot = require('postcss-selector-not')
let parseValue = require('postcss-value-parser')

module.exports = class extends NGN.EventEmitter {
	constructor (chassis, raw, isNamespaced = true) {
		super()

		try {
			this.tree = postcss.parse(raw)
		} catch (e) {
			throw e
		}

		this.core = new (require('./core.js'))(chassis)

		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis),
			atRules: NGN.private({}),
			imports: NGN.privateconst([]),
			isNamespaced: NGN.privateconst(isNamespaced),

			typographyEngineIsInitialized: NGN.privateconst(this.tree.some(node => {
				return node.type === 'atrule' && node.name === 'chassis' && node.params === 'init'
			})),

			generateNamespacedSelector: NGN.privateconst(selector => {
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
			}),

			namespaceSelectors: NGN.privateconst(() => {
				this.tree.walkRules(rule => {
					// Cleanup empty rulesets
					if (rule.nodes.length === 0) {
						rule.remove()
						return
					}

					if (rule.parent && rule.parent.type === 'atrule' && rule.parent.name === 'keyframes') {
						return
					}

					if (isNamespaced) {
						rule.selector = this.generateNamespacedSelector(rule.selector)
					}
				})
			}),

			processAtRule: NGN.privateconst((atRule, cb) => {
				let data = Object.assign({
					root: this.tree,
					atRule
				}, chassis.atRules.getProperties(atRule))

				chassis.atRules.process(data)
			}),

			processAtRules: NGN.privateconst(type => {
				if (this.atRules.hasOwnProperty(type) && this.atRules[type].length > 0) {
					this.atRules[type].forEach(atRule => {
						this.processAtRule(atRule)
					})

					delete this.atRules[type]
				}
			}),

			processFunctions: NGN.privateconst(type => {
				this.tree.walkDecls(decl => {
					let parsed = parseValue(decl.value)

					if (parsed.nodes.some(node => node.type === 'function')) {
						decl.value = chassis.functions.process({
							root: this.tree,
							raw: decl,
							parsed
						})
					}
				})
			}),

			processImport: NGN.privateconst((atRule) => {
				if (atRule.params.startsWith('import')) {
					this.processAtRule(atRule)
				}
			}),

			processImports: NGN.privateconst(() => {
				let {
					processImport,
					processImports
				} = this

				this.tree.walkAtRules('chassis', atRule => processImport(atRule))

				this.tree.walkAtRules(atRule => {
					if (atRule.params.includes('import')) {
						processImports()
					}
				})
			}),

			processMixins: NGN.privateconst(() => {
				let {
					processAtRules,
					processMixins,
					storeAtRules
				} = this

				storeAtRules()

				if (Object.keys(this.atRules).length === 0) {
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
			}),

			processNesting: NGN.privateconst(() => {
				this.tree = postcss.parse(nesting.process(this.tree))
			}),

			processNot: NGN.privateconst(() => {
				this.tree = postcss.parse(processNot.process(this.tree))
			}),

			storeAtRule: NGN.privateconst(atRule => {
				let params = atRule.params.split(' ')
				let container = params[0]
				let containers = ['import', 'include', 'new', 'extend']

				if (containers.includes(container)) {
					if (!this.atRules.hasOwnProperty(container)) {
						this.atRules[container] = []
					}

					this.atRules[container].push(atRule)
					return
				}

				if (!this.atRules.hasOwnProperty('other')) {
					this.atRules.other = []
				}

				this.atRules.other.push(atRule)
			}),

			storeAtRules: NGN.privateconst(() => {
				this.atRules = {}
				this.tree.walkAtRules('chassis', atRule => this.storeAtRule(atRule))
			})
		})
	}

	// TODO: Account for multiple "include" mixins
	process (filepath) {
		let {
			chassis,
			generateNamespacedSelector,
			isNamespaced,
			namespaceSelectors,
			processImports,
			processNesting,
			processAtRules,
			processMixins,
			processNot,
			processFunctions,
			storeAtRules,
			typographyEngineIsInitialized
		} = this

		let {
			atRules,
			post,
			settings,
			utils
		} = chassis

		let tasks = new NGN.Tasks()
		let sourceMap

		tasks.add('Processing Imports', next => {
			if (typographyEngineIsInitialized) {
				this.tree.walkAtRules('import', atRule => {
					chassis.imports.push(atRule.params)
					atRule.remove()
				})
			}

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

		if (typographyEngineIsInitialized) {
			tasks.add('Initializing Typography Engine', next => {
				this.tree = this.core.css.append(this.tree)
				next()
			})
		}

		tasks.add('Running Post-Processing Routines', next => {
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
				this.tree = processed.root
				next()
			}, err => console.error(err))
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
