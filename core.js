module.exports = (function () {
	let _ = new WeakMap()

	return class {
		constructor (chassis) {
			_.set(this, {
				chassis,
				baseTypography: chassis.settings.typography.ranges.first.typography,

				selectors: {
					outerContainers: '.chassis section, .chassis nav, .chassis form',
					innerContainers: '.chassis nav section, .chassis section nav, .chassis nav nav, .chassis article, .chassis fieldset, .chassis figure, .chassis pre, .chassis blockquote, .chassis table, .chassis canvas, .chassis embed'
				},

				appendNestedRulesets: (root, selectors, nestedRules) => {
					let { utils } = chassis

					Object.keys(nestedRules).forEach(nestedRule => {
						let nestedSelector = selectors.map(selector => `${selector} ${nestedRule}`).join(', ')
						let { properties, rules } = nestedRules[nestedRule]

						let decls = Object.keys(properties).map(property => {
							return utils.css.newDeclObj(property, properties[property])
						})

						root.append(utils.css.newRule(nestedSelector, decls))

						if (Object.keys(rules).length > 0) {
							_.get(this).appendNestedRulesets(root, [nestedSelector], rules)
						}
					})
				},

				applyTheme: (element, initialRule, root = chassis.utils.css.newRoot([])) => {
					let { theme, utils } = chassis

					let selectors = initialRule.selector.split(',').map(selector => selector.trim())
					let themeData = theme.getElement(element)

					if (!themeData) {
						return root.append(initialRule)
					}

					let propKeys = Object.keys(themeData.properties)
					let ruleKeys = Object.keys(themeData.rules)

					if (propKeys.length > 0) {
						let decls = []

						for (let property in themeData.properties) {
							decls.push(utils.css.newDecl(property, themeData.properties[property]))
						}

						initialRule.nodes = utils.css.mergeDecls(initialRule.nodes, decls)
					}

					root.append(initialRule)

					if (ruleKeys.length > 0) {
						let rulesets = _.get(this).appendNestedRulesets(root, selectors, themeData.rules)
					}

					return root
				},

				parseSpecSheet: (path, variables = {}) => {
					let { utils } = chassis

					let tree = utils.file.parseStyleSheet(path)

					if (!variables) {
						return tree
					}

					tree.walk(node => {
						if (node.type === 'atrule') {
							node.params = utils.string.resolveVariables(node.params, variables)
						}

						if (node.type === 'rule') {
							node.selector = utils.string.resolveVariables(node.selector, variables)
						}

						if (node.type === 'decl') {
							node.prop = utils.string.resolveVariables(node.prop, variables)
							node.value = utils.string.resolveVariables(node.value, variables)
						}
			    })

					return tree
				}
			})
		}

		get css () {
			return _.get(this).chassis.utils.css.newRoot([
				this.charset,
				this.viewport,
				this.reset,
				this.customProperties,
				this.customMedia,
				this.globalModifiers,
				this.constraints,
				this.html,
				this.body,
				this.rootHeadings,
				this.outerContainers,
				this.innerContainers,
				this.paragraph,
				this.typographyRanges,
				this.inlineComponentReset,
				this.inlineBlockComponentReset,
				this.blockComponentReset
			])
		}

		// TODO: Make this customizable via config params
		get charset () {
			let { utils } = _.get(this).chassis

			return utils.css.newAtRule({
				name: 'charset',
				params: '"UTF-8"'
			})
		}

		// TODO: Make this customizable via config params
		// NOTE: autoprefixer chokes if we create the @viewport rule manually, so
		// we're parsing it from a spec sheet as a workaround.
		// TODO: Look into a solution to the above issue
		get viewport () {
			let { utils } = _.get(this).chassis

			let root = _.get(this).parseSpecSheet('../style-sheets/viewport.css')

			root.nodes[0].push(utils.css.newDecl('width', 'device-width'))

			return root
		}

		get reset () {
			let { utils } = _.get(this).chassis
			let { fontSize, lineHeight } = _.get(this).baseTypography.root

			return _.get(this).parseSpecSheet('../style-sheets/reset.css', {
				'root-line-height': utils.unit.pxToEm(lineHeight, fontSize)
			})
		}

		get customProperties () {
			let { settings, theme, typography, utils } = _.get(this).chassis
			let { root, small, large, larger, largest } = settings.typography.ranges.first.typography
			let headingSizeAliases = settings.typography.fontSizes.headings

	    let rootLineHeightMult = utils.unit.pxToEm(root.lineHeight, root.fontSize)

			let props = _.get(this).parseSpecSheet('../style-sheets/custom-properties.css', {
				'layout-min-width': `${settings.layout.minWidth}px`,
				'layout-max-width': `${settings.layout.maxWidth}px`,
				'layout-gutter': settings.layout.gutter,

				// TODO: add breakpoint vars

				'typography-scale-ratio': settings.typography.scaleRatio,
				'root-font-size': `${root.fontSize}px`,
				'root-line-height': rootLineHeightMult,

				'inline-block-margin-x': `${typography.calculateInlineMarginX(rootLineHeightMult)}em`,
				'inline-block-margin-y': `${typography.calculateInlineMarginY(rootLineHeightMult)}em`,
				'inline-block-padding-x': `${typography.calculateInlinePaddingX(rootLineHeightMult)}em`,
				'inline-block-padding-y': `${typography.calculateInlinePaddingY(rootLineHeightMult)}em`,

				'pill-padding-x': `${settings.typography.scaleRatio}em`,
				'pill-border-radius': `${rootLineHeightMult}em`
			})

			// Add user-specified custom properties to root
			Object.keys(theme.customProperties).forEach(prop => {
				props.nodes[0].append(utils.css.newDeclObj(prop, theme.customProperties[prop]))
			})

			return props
		}

		get customMedia () {
			let { settings, utils } = _.get(this).chassis

			let nodes = []

			settings.viewportWidthRanges.records.forEach((range, index) => {
				let props = [
					utils.css.newAtRule({
						name: 'custom-media',
						params: `--${range.name}-vp screen and (min-width: ${range.lowerBound}px) and (max-width: ${range.upperBound}px)`
					})
				]

				if (range.lowerBound > 0) {
					props.unshift(utils.css.newAtRule({
						name: 'custom-media',
						params: `--${range.name}-vp-and-below screen and (max-width: ${range.lowerBound}px)`
					}))

					props.unshift(utils.css.newAtRule({
						name: 'custom-media',
						params: `--below-${range.name}-vp screen and (max-width: ${range.lowerBound - 1}px)`
					}))
				}

				props.push(utils.css.newAtRule({
					name: 'custom-media',
					params: `--${range.name}-vp-and-above screen and (min-width: ${range.lowerBound}px)`
				}))

				props.push(utils.css.newAtRule({
					name: 'custom-media',
					params: `--above-${range.name}-vp screen and (min-width: ${range.upperBound + 1}px)`
				}))

				nodes.push(...props)
			})

			return utils.css.newRoot([
				...nodes,
				// TODO: Find a better way to force a semicolon
				// Without this empty rulest, postcss will not add a semicolon to the end
				// of the last @custom-media at-rule. This empty ruleset will be cleaned
				// up later, during Chassis.process() operation.
				utils.css.newRule('.chassis', [])
			])
		}

		get globalModifiers () {
			// TODO: Add font-weight stuff here

			return _.get(this).parseSpecSheet('../style-sheets/global-modifiers.css')
		}

		get constraints () {
			let { layout, settings, utils } = _.get(this).chassis

			let rules = [
				utils.css.newRule('.chassis .constraint.width', [
					utils.css.newDeclObj('width', '100%'),
					utils.css.newDeclObj('min-width', `${settings.layout.minWidth}px`),
					utils.css.newDeclObj('max-width', `${settings.layout.maxWidth}px`),
					utils.css.newDeclObj('margin', '0 auto'),
					utils.css.newDeclObj('padding-left', `${settings.layout.gutter}`),
					utils.css.newDeclObj('padding-right', `${settings.layout.gutter}`)
				])
			]

			let calculatedValueUnits = [
				'vw', '%'
			]

			let gutterUnits = utils.string.getUnits(settings.layout.gutter)

			if (calculatedValueUnits.includes(gutterUnits)) {
				rules.push(...[
					utils.css.newAtRule({
						name: 'media',
						params: `screen and (max-width: ${settings.layout.minWidth}px)`,
						nodes: [
							utils.css.newRule('.chassis .constraint.width', [
								utils.css.newDecl('padding-left', layout.minGutterWidth),
								utils.css.newDecl('padding-right', layout.minGutterWidth)
							])
						]
					}),
					utils.css.newAtRule({
						name: 'media',
						params: `screen and (min-width: ${settings.layout.maxWidth}px)`,
						nodes: [
							utils.css.newRule('.chassis .constraint.width', [
								utils.css.newDecl('padding-left', layout.maxGutterWidth),
								utils.css.newDecl('padding-right', layout.maxGutterWidth)
							])
						]
					})
				])
			}

			return utils.css.newRoot(rules)
		}

		get html () {
			let { constants, settings, theme, utils } = _.get(this).chassis
			let { fontSize, lineHeight } = _.get(this).baseTypography.root

			let root = _.get(this).applyTheme('html', utils.css.newRule('html.chassis', [
				utils.css.newDeclObj('font-size', `${fontSize}px`)
			]))

			return root
		}

		get body () {
			let { settings, theme, utils } = _.get(this).chassis
			let { fontSize, lineHeight } = _.get(this).baseTypography.root

			return _.get(this).applyTheme('body', utils.css.newRule('.chassis body', [
				utils.css.newDeclObj('min-width', `${settings.layout.minWidth}px`),
				utils.css.newDeclObj('font-family', 'var(--font-family, initial)'),
				utils.css.newDeclObj('color', 'var(--text-color, initial)')
			]))
		}

		get rootHeadings () {
			let { settings, theme, typography, utils } = _.get(this).chassis
			let { root } = _.get(this).baseTypography

			let headingSizeAliases = settings.typography.fontSizes.headings
			let formLegendAlias = settings.typography.fontSizes.formLegend
			let rules = utils.css.newRoot([])

			for (let i = 1; i <= 6; i++) {
				_.get(this).applyTheme(`h${i}`, utils.css.newRule(`.chassis h${i}`, [
					utils.css.newDeclObj(
						'font-size',
						`${utils.unit.pxToEm(_.get(this).baseTypography[headingSizeAliases[i]].fontSize, root.fontSize)}em`
					),
					utils.css.newDeclObj(
						'line-height',
						`${utils.unit.pxToEm(_.get(this).baseTypography[headingSizeAliases[i]].lineHeight, _.get(this).baseTypography[headingSizeAliases[i]].fontSize)}`
					),
					utils.css.newDeclObj(
						'margin-bottom',
						`${utils.unit.pxToEm(typography.calculateMarginBottom(_.get(this).baseTypography[headingSizeAliases[i]].lineHeight), _.get(this).baseTypography[headingSizeAliases[i]].fontSize)}em`
					)
				]), rules)
			}

			_.get(this).applyTheme('legend', utils.css.newRule('.chassis legend', [
				utils.css.newDeclObj(
					'font-size',
					`${utils.unit.pxToEm(_.get(this).baseTypography[formLegendAlias].fontSize, root.fontSize)}rem`
				),
				utils.css.newDeclObj(
					'line-height',
					`${utils.unit.pxToEm(_.get(this).baseTypography[formLegendAlias].lineHeight, _.get(this).baseTypography[formLegendAlias].fontSize)}`
				),
				utils.css.newDeclObj(
					'margin-bottom',
					`${utils.unit.pxToEm(typography.calculateMarginBottom(_.get(this).baseTypography[formLegendAlias].lineHeight), _.get(this).baseTypography[formLegendAlias].fontSize)}em`
				)
			]), rules)

			return rules
		}

		get typographyRanges () {
			let { layout, settings, typography, utils } = _.get(this).chassis

			let { ranges } = settings.typography
			let mediaQueries = utils.css.newRoot([])

			for (let i = 1; i < ranges.recordCount; i++) {
				let range = ranges.find(i)
				let { fontSize, lineHeight } = range.typography.root

				let mediaQuery = utils.css.newAtRule({
					name: 'media',
					params: `screen and (min-width: ${range.bounds.lower}px)`,
					nodes: []
				})

				let htmlRule = utils.css.newRule('html.chassis', [])

				if (fontSize !== _.get(this).baseTypography.root.fontSize) {
					htmlRule.append(utils.css.newDecl('font-size', `${fontSize}px`))
				}

				htmlRule.append(utils.css.newDecl('line-height', `${utils.unit.pxToEm(lineHeight, fontSize)}`))

				mediaQuery.nodes.push(htmlRule)

				let bodyRule = utils.css.newRule('.chassis body', [
					utils.css.newDecl('line-height', `${utils.unit.pxToEm(lineHeight, fontSize)}`)
				])

				mediaQuery.nodes.push(bodyRule)

				let headingSizeAliases = settings.typography.fontSizes.headings
				let formLegendAlias = settings.typography.fontSizes.formLegend

				for (let i = 1; i <= 6; i++) {
					mediaQuery.nodes.push(utils.css.newRule(`.chassis h${i}`, [
						utils.css.newDeclObj(
							'line-height',
							`${utils.unit.pxToEm(range.typography[headingSizeAliases[i]].lineHeight, range.typography[headingSizeAliases[i]].fontSize)}`
						),
						utils.css.newDeclObj(
							'margin-bottom',
							`${utils.unit.pxToEm(typography.calculateMarginBottom(range.typography[headingSizeAliases[i]].lineHeight), range.typography[headingSizeAliases[i]].fontSize)}em`
						)
					]))
				}

				mediaQuery.nodes.push(utils.css.newRule('.chassis legend', [
					utils.css.newDeclObj(
						'line-height',
						`${utils.unit.pxToEm(range.typography[formLegendAlias].lineHeight, range.typography[formLegendAlias].fontSize)}`
					),
					utils.css.newDeclObj(
						'margin-bottom',
						`${utils.unit.pxToEm(typography.calculateMarginBottom(range.typography[formLegendAlias].lineHeight), range.typography[formLegendAlias].fontSize)}em`
					)
				]))

				mediaQuery.nodes.push(utils.css.newRule(_.get(this).selectors.outerContainers, [
					utils.css.newDeclObj(
						'margin-bottom',
						`${utils.unit.pxToEm(layout.calculateMarginBottom(range.typography.root.lineHeight, 'outer'), range.typography.root.fontSize)}em`
					)
				]))

				mediaQuery.nodes.push(utils.css.newRule(_.get(this).selectors.innerContainers, [
					utils.css.newDeclObj(
						'margin-bottom',
						`${utils.unit.pxToEm(layout.calculateMarginBottom(range.typography.root.lineHeight, 'inner'), range.typography.root.fontSize)}em`
					)
				]))

				mediaQuery.nodes.push(utils.css.newRule('.chassis p', [
					utils.css.newDeclObj(
						'margin-bottom',
						`${utils.unit.pxToEm(range.typography.root.lineHeight, range.typography.root.fontSize)}em`
					),
					utils.css.newDecl(
						'line-height',
						`${utils.unit.pxToEm(lineHeight, fontSize)}`
					)
				]))

				mediaQueries.append(mediaQuery)
			}

			return mediaQueries
		}

		get outerContainers () {
			let { layout, utils } = _.get(this).chassis
			let { fontSize, lineHeight } = _.get(this).baseTypography.root

			return _.get(this).parseSpecSheet('../style-sheets/outer-containers.css', {
				'selectors': _.get(this).selectors.outerContainers,
				'margin-bottom': `${utils.unit.pxToEm(layout.calculateMarginBottom(lineHeight, 'outer'), fontSize)}em`
			})
		}

		get innerContainers () {
			let { layout, utils } = _.get(this).chassis
			let { fontSize, lineHeight } = _.get(this).baseTypography.root

			return _.get(this).parseSpecSheet('../style-sheets/inner-containers.css', {
				'selectors': _.get(this).selectors.innerContainers,
				'margin-bottom': `${utils.unit.pxToEm(layout.calculateMarginBottom(lineHeight, 'inner'), fontSize)}em`
			})
		}

		get paragraph () {
			let { layout, utils } = _.get(this).chassis
			let { fontSize, lineHeight } = _.get(this).baseTypography.root

			return _.get(this).parseSpecSheet('../style-sheets/paragraph.css', {
				'margin-bottom': `${utils.unit.pxToEm(lineHeight, fontSize)}em`
			})
		}

		get inlineComponentReset () {
			return _.get(this).parseSpecSheet('../style-sheets/inline-component-reset.css')
		}

		get inlineBlockComponentReset () {
			return _.get(this).parseSpecSheet('../style-sheets/inline-block-component-reset.css')
		}

		get blockComponentReset () {
			return _.get(this).parseSpecSheet('../style-sheets/block-component-reset.css')
		}
	}
})()
