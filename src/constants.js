class ChassisConstants {
	// Order is important!
	// The order specified here determines the order in which components will be
	// added to the style sheet; This must be correct for proper cascade behavior.
	static get components () {
		return new Map([
			['anchor', require('./components/anchor/component.js')],
			['svg-icon', require('./components/svg-icon/component.js')],
			['button', require('./components/button/component.js')],
			['anchor-button', require('./components/anchor-button/component.js')],
			['buttons', ['button', 'anchor-button']],
			['tag', require('./components/tag/component.js')],
			['table', require('./components/table/component.js')],
			['overlay', require('./components/overlay/component.js')],
			['modal', require('./components/modal/component.js')],
			['input', require('./components/input/component.js')],
			['textarea', require('./components/textarea/component.js')],
			['chassis-select', require('./components/chassis-select/component.js')],
			['chassis-control', require('./components/chassis-control/component.js')],
			['form-controls', ['input', 'textarea', 'chassis-select', 'chassis-control']]
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
			defaultFilePath: '../style-sheets/default-theme.css'
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
					'minor 2nd':    16 / 15,
					'major 2nd':    9 / 8,
					'minor 3rd':    6 / 5,
					'major 3rd':    5 / 4,
					'perfect 4th':  4 / 3,
					'tritone':      45 / 32,
					'perfect 5th':  3 / 2,
					'minor 6th':    8 / 5,
					'golden ratio': (1 + Math.sqrt(5)) / 2,
					'major 6th':    5 / 3,
					'minor 7th':    16 / 9,
					'major 7th':    15 / 8,
					'octave':       2
				},
				threshold: 640 // The viewport width above which font size should start to increment from base
			},
			sizeAliases: ['small', 'root', 'large', 'larger', 'largest']
		}
	}
}

module.exports = ChassisConstants
