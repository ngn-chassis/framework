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
			['overlay', {
				component: require('./components/overlay/component.js'),
				dependencies: []
			}],
			['modal', {
				component: require('./components/modal/component.js'),
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
			['chassis-optgroup', {
				component: require('./components/chassis-optgroup/component.js'),
				dependencies: []
			}],
			['chassis-optgroup-label', {
				component: require('./components/chassis-optgroup-label/component.js'),
				dependencies: []
			}],
			['chassis-options', {
				component: require('./components/chassis-options/component.js'),
				dependencies: []
			}],
			['chassis-option', {
				component: require('./components/chassis-option/component.js'),
				dependencies: []
			}],
			['chassis-selected-options', {
				component: require('./components/chassis-selected-options/component.js'),
				dependencies: []
			}],
			['chassis-select', {
				component: require('./components/chassis-select/component.js'),
				dependencies: ['chassis-selected-options', 'chassis-options', 'chassis-option', 'chassis-optgroup', 'chassis-optgroup-label', 'chassis-select']
			}],
			['chassis-datalist', {
				component: require('./components/chassis-datalist/component.js'),
				dependencies: ['chassis-options', 'chassis-option']
			}],
			['chassis-control', {
				component: require('./components/chassis-control/component.js'),
				dependencies: []
			}],
			['form-controls', ['input', 'textarea', 'chassis-select', 'chassis-datalist', 'chassis-control']]
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
