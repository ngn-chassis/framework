module.exports = class {
	constructor (chassis) {
		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis),
			baseTypography: NGN.privateconst(chassis.settings.typography.ranges.first.typography),

			selectors: NGN.privateconst({
				outerContainers: '.chassis section, .chassis nav, .chassis form',
				innerContainers: '.chassis nav section, .chassis section nav, .chassis nav nav, .chassis article, .chassis fieldset, .chassis figure, .chassis pre, .chassis blockquote, .chassis table, .chassis canvas, .chassis embed'
			}),

			appendNestedRulesets: NGN.privateconst((root, selectors, nestedRules) => {
				let { utils } = chassis

				Object.keys(nestedRules).forEach(nestedRule => {
					let nestedSelector = selectors.map(selector => `${selector} ${nestedRule}`).join(', ')
					let { properties, rules } = nestedRules[nestedRule]

					let decls = Object.keys(properties).map(property => {
						return utils.css.createDeclObj(property, properties[property])
					})

					root.append(utils.css.createRule(nestedSelector, decls))

					if (Object.keys(rules).length > 0) {
						this.appendNestedRulesets(root, [nestedSelector], rules)
					}
				})
			}),

			applyTheme: NGN.privateconst((element, initialRule, root = chassis.utils.css.createRoot([])) => {
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
						decls.push(utils.css.createDecl(property, themeData.properties[property]))
					}

					initialRule.nodes = utils.css.mergeDecls(initialRule.nodes, decls)
				}

				root.append(initialRule)

				if (ruleKeys.length > 0) {
					let rulesets = this.appendNestedRulesets(root, selectors, themeData.rules)
				}

				return root
			}),

			parseSpecSheet: NGN.privateconst((path, variables = {}) => {
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
			})
		})
	}

	get css () {
		return this.chassis.utils.css.createRoot([
			this.charset,
			this.imports,
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
		let { utils } = this.chassis

		return utils.css.createAtRule({
			name: 'charset',
			params: '"UTF-8"'
		})
	}

	get imports () {
		let { imports, utils } = this.chassis

		return utils.css.createRoot([
			...imports.map(path => {
				return utils.css.createAtRule({
					name: 'import',
					params: path
				})
			}),
			utils.css.createRule('null', [])
		])
	}

	// TODO: Make this customizable via config params
	// NOTE: autoprefixer chokes if we create the @viewport rule manually, so
	// we're parsing it from a spec sheet as a workaround.
	// TODO: Look into a solution to the above issue
	get viewport () {
		let { utils } = this.chassis
		let root = this.parseSpecSheet('../style-sheets/viewport.css')

		root.nodes[0].push(utils.css.createDecl('width', 'device-width'))

		return root
	}

	get reset () {
		let { utils } = this.chassis
		let { fontSize, lineHeight } = this.baseTypography.root

		return this.parseSpecSheet('../style-sheets/reset.css', {
			'root-line-height': utils.unit.pxToEm(lineHeight, fontSize)
		})
	}

	get customProperties () {
		let { layout, settings, theme, typography, utils } = this.chassis
		let { root, small, large, larger, largest } = settings.typography.ranges.first.typography
		let headingSizeAliases = settings.typography.fontSizes.headings

		let rootLineHeightMult = utils.unit.pxToEm(root.lineHeight, root.fontSize)

		let props = this.parseSpecSheet('../style-sheets/custom-properties.css', {
			'layout-min-width': `${settings.layout.minWidth}px`,
			'layout-max-width': `${settings.layout.maxWidth}px`,
			'layout-gutter': settings.layout.gutter,
			'layout-min-gutter': layout.minGutterWidth,
			'layout-max-gutter': layout.maxGutterWidth,

			// TODO: add breakpoint vars

			'typography-scale-ratio': settings.typography.scaleRatio,
			'root-font-size': `${root.fontSize}px`,
			'root-line-height': rootLineHeightMult,

			// 'block-margin-x': ,
			// 'block-margin-y': `${layout.calculateMarginBottom(rootLineHeightMult, 'outer')}em`,
			// 'block-padding-x': ,
			// 'block-padding-y': ,

			'inline-block-margin-x': `${typography.calculateInlineMarginX(rootLineHeightMult)}em`,
			'inline-block-margin-y': `${typography.calculateInlineMarginY(rootLineHeightMult)}em`,
			'inline-block-padding-x': `${typography.calculateInlinePaddingX(rootLineHeightMult)}em`,
			'inline-block-padding-y': `${typography.calculateInlinePaddingY(rootLineHeightMult)}em`,

			'pill-padding-x': `${settings.typography.scaleRatio}em`,
			'pill-border-radius': `${rootLineHeightMult}em`
		})

		// Add user-specified custom properties to root
		Object.keys(theme.customProperties).forEach(prop => {
			props.nodes[0].append(utils.css.createDeclObj(prop, theme.customProperties[prop]))
		})

		return props
	}

	get customMedia () {
		let { settings, utils } = this.chassis

		let nodes = []

		settings.viewportWidthRanges.records.forEach((range, index) => {
			let props = [
				utils.css.createAtRule({
					name: 'custom-media',
					params: `--${range.name}-vp screen and (min-width: ${range.lowerBound}px) and (max-width: ${range.upperBound}px)`
				})
			]

			if (range.lowerBound > 0) {
				props.unshift(utils.css.createAtRule({
					name: 'custom-media',
					params: `--${range.name}-vp-and-below screen and (max-width: ${range.lowerBound}px)`
				}))

				props.unshift(utils.css.createAtRule({
					name: 'custom-media',
					params: `--below-${range.name}-vp screen and (max-width: ${range.lowerBound - 1}px)`
				}))
			}

			props.push(utils.css.createAtRule({
				name: 'custom-media',
				params: `--${range.name}-vp-and-above screen and (min-width: ${range.lowerBound}px)`
			}))

			props.push(utils.css.createAtRule({
				name: 'custom-media',
				params: `--above-${range.name}-vp screen and (min-width: ${range.upperBound + 1}px)`
			}))

			nodes.push(...props)
		})

		return utils.css.createRoot([
			...nodes,
			// TODO: Find a better way to force a semicolon
			// Without this empty rulest, postcss will not add a semicolon to the end
			// of the last @custom-media at-rule. This empty ruleset will be cleaned
			// up later, during Chassis.process() operation.
			utils.css.createRule('.chassis', [])
		])
	}

	get globalModifiers () {
		// TODO: Add font-weight stuff here

		return this.parseSpecSheet('../style-sheets/global-modifiers.css')
	}

	get constraints () {
		let { layout, settings, utils } = this.chassis

		let rules = [
			utils.css.createRule('.chassis .constraint.width', [
				utils.css.createDeclObj('width', '100%'),
				utils.css.createDeclObj('min-width', `${settings.layout.minWidth}px`),
				utils.css.createDeclObj('max-width', `${settings.layout.maxWidth}px`),
				utils.css.createDeclObj('margin', '0 auto'),
				utils.css.createDeclObj('padding-left', `${settings.layout.gutter}`),
				utils.css.createDeclObj('padding-right', `${settings.layout.gutter}`)
			])
		]

		let calculatedValueUnits = [
			'vw', '%'
		]

		let gutterUnits = utils.string.getUnits(settings.layout.gutter)

		if (calculatedValueUnits.includes(gutterUnits)) {
			rules.push(...[
				utils.css.createAtRule({
					name: 'media',
					params: `screen and (max-width: ${settings.layout.minWidth}px)`,
					nodes: [
						utils.css.createRule('.chassis .constraint.width', [
							utils.css.createDecl('padding-left', layout.minGutterWidth),
							utils.css.createDecl('padding-right', layout.minGutterWidth)
						])
					]
				}),
				utils.css.createAtRule({
					name: 'media',
					params: `screen and (min-width: ${settings.layout.maxWidth}px)`,
					nodes: [
						utils.css.createRule('.chassis .constraint.width', [
							utils.css.createDecl('padding-left', layout.maxGutterWidth),
							utils.css.createDecl('padding-right', layout.maxGutterWidth)
						])
					]
				})
			])
		}

		return utils.css.createRoot(rules)
	}

	get html () {
		let { constants, layout, settings, theme, typography, utils } = this.chassis
		let { fontSize, lineHeight } = this.baseTypography.root

		let root = this.applyTheme('html', utils.css.createRule('html.chassis', [
			utils.css.createDeclObj('font-size', `${fontSize}px`)
			// Support 'minFontSize' value
			// utils.css.createDeclObj('font-size', `${Math.max(fontSize, minFontSize)}px`)
		]))

		return root
	}

	get body () {
		let { settings, theme, utils } = this.chassis
		let { fontSize, lineHeight } = this.baseTypography.root

		return this.applyTheme('body', utils.css.createRule('.chassis body', [
			utils.css.createDeclObj('min-width', `${settings.layout.minWidth}px`),
			utils.css.createDeclObj('font-family', 'var(--font-family, initial)'),
			utils.css.createDeclObj('color', 'var(--text-color, initial)')
		]))
	}

	get rootHeadings () {
		let { settings, theme, typography, utils } = this.chassis
		let { root } = this.baseTypography

		let headingSizeAliases = settings.typography.fontSizes.headings
		let formLegendAlias = settings.typography.fontSizes.formLegend
		let rules = utils.css.createRoot([])

		let heading

		for (let i = 1; i <= 6; i++) {
			heading = this.baseTypography[headingSizeAliases[i]]

			this.applyTheme(`h${i}`, utils.css.createRule(`.chassis h${i}`, [
				utils.css.createDeclObj(
					'font-size',
					`${utils.unit.pxToEm(heading.fontSize, root.fontSize)}em`
				),

				utils.css.createDeclObj(
					'line-height',
					`${utils.unit.pxToEm(heading.lineHeight, heading.fontSize)}`
				),

				utils.css.createDeclObj(
					'margin-bottom',
					`${utils.unit.pxToEm(typography.calculateMarginBottom(heading.lineHeight), heading.fontSize)}em`
				)
			]), rules)
		}

		heading = this.baseTypography[formLegendAlias]

		this.applyTheme('legend', utils.css.createRule('.chassis legend', [
			utils.css.createDeclObj(
				'font-size',
				`${utils.unit.pxToEm(heading.fontSize, root.fontSize)}rem`
			),

			utils.css.createDeclObj(
				'line-height',
				`${utils.unit.pxToEm(heading.lineHeight, heading.fontSize)}`
			),

			utils.css.createDeclObj(
				'margin-bottom',
				`${utils.unit.pxToEm(typography.calculateMarginBottom(heading.lineHeight), heading.fontSize)}em`
			)
		]), rules)

		return rules
	}

	get typographyRanges () {
		let { layout, settings, typography, utils } = this.chassis

		let { ranges } = settings.typography
		let mediaQueries = utils.css.createRoot([])

		for (let i = 1; i < ranges.recordCount; i++) {
			let range = ranges.find(i)
			let { fontSize, lineHeight } = range.typography.root

			let mediaQuery = utils.css.createAtRule({
				name: 'media',
				params: `screen and (min-width: ${range.bounds.lower}px)`,
				nodes: []
			})

			let htmlRule = utils.css.createRule('html.chassis', [])

			if (i === 1) {
				let vw = fontSize / ((1000 - ((typography.scale.ratio * 1000) - 1000)) / fontSize)
				console.log(`calc(${vw}vw + ${fontSize - vw}px)`);
				htmlRule.append(utils.css.createDecl('font-size', `calc(${vw}vw + ${fontSize - vw}px)`))
			}

			// if (fontSize !== this.baseTypography.root.fontSize) {
			// 	// fontSize / (1000 - ((typography.scale.ratio * 1000) - 1000) / fontSize)
			// 	let vw = fontSize / ((1000 - ((typography.scale.ratio * 1000) - 1000)) / fontSize)
			//
			// 	console.log(`calc(${vw}vw + ${fontSize - vw}px)`);
			//
			// 	// let calc = `calc(${fontSize / (range.bounds.lower / fontSize)}vw + ${fontSize}px)`
			// 	// console.log(calc);
			// 	htmlRule.append(utils.css.createDecl('font-size', `calc(${vw}vw + ${fontSize - vw}px)`))
			// }

			htmlRule.append(utils.css.createDecl('line-height', `${utils.unit.pxToEm(lineHeight, fontSize)}`))

			mediaQuery.nodes.push(htmlRule)

			let bodyRule = utils.css.createRule('.chassis body', [
				utils.css.createDecl('line-height', `${utils.unit.pxToEm(lineHeight, fontSize)}`)
			])

			mediaQuery.nodes.push(bodyRule)

			let headingSizeAliases = settings.typography.fontSizes.headings
			let formLegendAlias = settings.typography.fontSizes.formLegend

			let heading

			for (let i = 1; i <= 6; i++) {
				heading = range.typography[headingSizeAliases[i]]

				mediaQuery.nodes.push(utils.css.createRule(`.chassis h${i}`, [
					utils.css.createDeclObj(
						'line-height',
						`${utils.unit.pxToEm(heading.lineHeight, heading.fontSize)}`
					),

					utils.css.createDeclObj(
						'margin-bottom',
						`${utils.unit.pxToEm(typography.calculateMarginBottom(heading.lineHeight), heading.fontSize)}em`
					)
				]))
			}

			heading = range.typography[formLegendAlias]

			mediaQuery.nodes.push(utils.css.createRule('.chassis legend', [
				utils.css.createDeclObj(
					'line-height',
					`${utils.unit.pxToEm(heading.lineHeight, heading.fontSize)}`
				),

				utils.css.createDeclObj(
					'margin-bottom',
					`${utils.unit.pxToEm(typography.calculateMarginBottom(heading.lineHeight), heading.fontSize)}em`
				)
			]))

			mediaQuery.nodes.push(utils.css.createRule(this.selectors.outerContainers, [
				utils.css.createDeclObj(
					'margin-bottom',
					`${utils.unit.pxToEm(layout.calculateMarginBottom(lineHeight, 'outer'), fontSize)}em`
				)
			]))

			mediaQuery.nodes.push(utils.css.createRule(this.selectors.innerContainers, [
				utils.css.createDeclObj(
					'margin-bottom',
					`${utils.unit.pxToEm(layout.calculateMarginBottom(lineHeight, 'inner'), fontSize)}em`
				)
			]))

			mediaQuery.nodes.push(utils.css.createRule('.chassis p', [
				utils.css.createDeclObj(
					'margin-bottom',
					`${utils.unit.pxToEm(lineHeight, fontSize)}em`
				),

				utils.css.createDecl(
					'line-height',
					`${utils.unit.pxToEm(lineHeight, fontSize)}`
				)
			]))

			mediaQueries.append(mediaQuery)
		}

		return mediaQueries
	}

	get outerContainers () {
		let { layout, utils } = this.chassis
		let { fontSize, lineHeight } = this.baseTypography.root

		return this.parseSpecSheet('../style-sheets/outer-containers.css', {
			'selectors': this.selectors.outerContainers,
			'margin-bottom': `${utils.unit.pxToEm(layout.calculateMarginBottom(lineHeight, 'outer'), fontSize)}em`
		})
	}

	get innerContainers () {
		let { layout, utils } = this.chassis
		let { fontSize, lineHeight } = this.baseTypography.root

		return this.parseSpecSheet('../style-sheets/inner-containers.css', {
			'selectors': this.selectors.innerContainers,
			'margin-bottom': `${utils.unit.pxToEm(layout.calculateMarginBottom(lineHeight, 'inner'), fontSize)}em`
		})
	}

	get paragraph () {
		let { layout, utils } = this.chassis
		let { fontSize, lineHeight } = this.baseTypography.root

		return this.parseSpecSheet('../style-sheets/paragraph.css', {
			'margin-bottom': `${utils.unit.pxToEm(lineHeight, fontSize)}em`
		})
	}

	get inlineComponentReset () {
		return this.parseSpecSheet('../style-sheets/inline-component-reset.css')
	}

	get inlineBlockComponentReset () {
		return this.parseSpecSheet('../style-sheets/inline-block-component-reset.css')
	}

	get blockComponentReset () {
		return this.parseSpecSheet('../style-sheets/block-component-reset.css')
	}
}
