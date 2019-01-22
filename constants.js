module.exports = class ChassisConstants {
	// Order is important!
	// The order specified here determines the order in which components will be
	// added to the style sheet; This must be correct for proper cascade behavior.
	static get components () {
		return new Map([
			['anchor', {
				component: require('./components/anchor/component.js'),
				dependencies: []
			}],
			['svg-icon', {
				component: require('./components/svg-icon/component.js'),
				dependencies: []
			}],
			['button', {
				component: require('./components/button/component.js'),
				dependencies: []
			}],
			['anchor-button', {
				component: require('./components/anchor-button/component.js'),
				dependencies: []
			}],
			['buttons', ['button', 'anchor-button']],
			['tag', {
				component: require('./components/tag/component.js'),
				dependencies: []
			}],
			['table', {
				component: require('./components/table/component.js'),
				dependencies: []
			}],
			['author-data-table', {
				component: require('./components/author-data-table/component.js'),
				dependencies: []
			}],
			['author-overlay', {
				component: require('./components/author-overlay/component.js'),
				dependencies: []
			}],
			['author-modal', {
				component: require('./components/author-modal/component.js'),
				dependencies: []
			}],
			['input', {
				component: require('./components/input/component.js'),
				dependencies: []
			}],
			['textarea', {
				component: require('./components/textarea/component.js'),
				dependencies: []
			}],
			['author-optgroup', {
				component: require('./components/author-optgroup/component.js'),
				dependencies: []
			}],
			['author-optgroup-label', {
				component: require('./components/author-optgroup-label/component.js'),
				dependencies: []
			}],
			['author-options', {
				component: require('./components/author-options/component.js'),
				dependencies: []
			}],
			['author-option', {
				component: require('./components/author-option/component.js'),
				dependencies: []
			}],
			['author-selected-options', {
				component: require('./components/author-selected-options/component.js'),
				dependencies: []
			}],
			['author-select', {
				component: require('./components/author-select/component.js'),
				dependencies: ['author-selected-options', 'author-options', 'author-option', 'author-optgroup', 'author-optgroup-label', 'author-select']
			}],
			['author-datalist', {
				component: require('./components/author-datalist/component.js'),
				dependencies: ['author-options', 'author-option']
			}],
			['author-control', {
				component: require('./components/author-control/component.js'),
				dependencies: []
			}],
			['author-layout-cell', {
				component: require('./components/author-layout-cell/component.js'),
				dependencies: []
			}],
			['author-layout', {
				component: require('./components/author-layout/component.js'),
				dependencies: ['author-layout-cell']
			}],
			['form-controls', ['input', 'textarea', 'author-select', 'author-datalist', 'author-control']]
		])
	}

	static get layout () {
		return {
			viewport: {
				minWidth: 0,
				maxWidth: 7680, // Up to 8k displays supported
				widthIncrement: 320
			},
			mediaQueries: {
				operators: ['<', '<=', '=', '>=', '>']
			}
		}
	}

	static get theme () {
		return {
			defaultFilePath: '../default.theme'
		}
	}

	static get typography () {
		return {
			breakpoints: (() => {
				let { viewport } = this.layout
				let breakpoints = []

				for (let width = viewport.minWidth; width <= viewport.maxWidth; width += viewport.widthIncrement) {
					breakpoints.push(width)
				}

				return breakpoints
			})(),
			scale: {
				ratios: {
					'minor 2nd':      16 / 15,
					'minor second':   16 / 15,
					'major 2nd':      9 / 8,
					'major second':   9 / 8,
					'minor 3rd':      6 / 5,
					'minor third':    6 / 5,
					'major 3rd':      5 / 4,
					'major third':    5 / 4,
					'perfect 4th':    4 / 3,
					'perfect fourth': 4 / 3,
					'tritone':        45 / 32,
					'perfect 5th':    3 / 2,
					'perfect fifth':  3 / 2,
					'minor 6th':      8 / 5,
					'minor sixth':    8 / 5,
					'golden ratio':   (1 + Math.sqrt(5)) / 2,
					'major 6th':      5 / 3,
					'major sixth':    5 / 3,
					'minor 7th':      16 / 9,
					'minor seventh':  16 / 9,
					'major 7th':      15 / 8,
					'major seventh':  15 / 8,
					'octave':         2
				},
				threshold: 640 // The viewport width above which font size should start to increment from base
			},
			sizeAliases: ['small', 'root', 'large', 'larger', 'largest']
		}
	}
}
