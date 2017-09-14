class ChassisButtonLinkComponent {
  constructor (chassis) {
    this.chassis = chassis
    this.resetType = 'inline-block'
    
    this.overridesLinks = true
  }

  get variables () {
    let { settings, typography, utils } = this.chassis
    let { fontSize, lineHeight } = settings.typography.ranges.first.typography.root

    let lineHeightMultiplier = utils.units.toEms(lineHeight, fontSize)
    let inlineHeight = typography.calculateInlineHeight(lineHeightMultiplier)
		let padding = (inlineHeight - lineHeightMultiplier) / 2

    return {
      'margin-right': `${typography.calculateInlineMarginX(lineHeightMultiplier)}em`,
      'margin-bottom': `${typography.calculateInlineMarginY(lineHeightMultiplier)}em`,
      'padding-x': `${typography.calculateInlinePaddingX(lineHeightMultiplier)}em`,
      'line-height': typography.calculateInlineHeight(lineHeightMultiplier),
      'icon-offset': `translateX(-${(typography.calculateInlinePaddingX(lineHeightMultiplier) / 2) - utils.units.toEms(fontSize / (settings.typography.scaleRatio * 10), fontSize)}em)`,
      'pill-padding-x': `${settings.typography.scaleRatio}em`,
      'pill-border-radius': `${lineHeightMultiplier}em`,
      'multi-line-padding-y': `${padding}em`,
			'multi-line-line-height': `${lineHeightMultiplier}`,
			'multi-line-white-space': 'normal'
    }
  }
}

module.exports = ChassisButtonLinkComponent
