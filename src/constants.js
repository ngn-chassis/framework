const ChassisButtonComponent = require('./components/button/component.js')
const ChassisButtonLinkComponent = require('./components/button-link/component.js')
const ChassisSvgIconComponent = require('./components/svg-icon/component.js')
const ChassisLinkComponent = require('./components/link/component.js')
const ChassisModalComponent = require('./components/modal/component.js')
const ChassisOverlayComponent = require('./components/overlay/component.js')
const ChassisTableComponent = require('./components/table/component.js')
const ChassisTagComponent = require('./components/tag/component.js')
const ChassisFormFieldComponent = require('./components/form-field/component.js')
const ChassisFormToggleComponent = require('./components/form-toggle/component.js')
const ChassisSelectMenuComponent = require('./components/select-menu/component.js')

class ChassisConstants {
	// Order is important!
	// The order specified here determines the order in which components will be
	// added to the style sheet; This must be correct for proper cascade behavior.
	static get components () {
		return new Map([
			['link', ChassisLinkComponent],
			['svg-icon', ChassisSvgIconComponent],
			['button', ChassisButtonComponent],
			['button-link', ChassisButtonLinkComponent],
			['buttons', ['button', 'button-link']],
			['tag', ChassisTagComponent],
			['table', ChassisTableComponent],
			['overlay', ChassisOverlayComponent],
			['modal', ChassisModalComponent],
			['form-field', ChassisFormFieldComponent],
			['form-toggle', ChassisFormToggleComponent],
			['select-menu', ChassisSelectMenuComponent],
			['form-controls', ['form-field', 'form-toggle', 'select-menu']]
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
					'minor 2nd': 1 + (1 / 12),
					'major 2nd': 1 + (2 / 12),
					'minor 3rd': 1 + (3 / 12),
					'major 3rd': 1 + (4 / 12),
					'perfect 4th': 1 + (5 / 12),
					'tritone': 1 + (6 / 12),
					'perfect 5th': 1 + (7 / 12),
					'golden ratio': 1.61803398875,
					'minor 6th': 1 + (8 / 12),
					'major 6th': 1 + (9 /12),
					'minor 7th': 1 + (10 / 12),
					'major 7th': 1 + (11 / 12)
				},
				threshold: 640 // The viewport width above which font size should start to increment from base
			},
			sizeAliases: ['small', 'root', 'large', 'larger', 'largest']
		}
	}
}

module.exports = ChassisConstants
