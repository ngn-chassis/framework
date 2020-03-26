import Config from '../../data/Config.js'
import LayoutUtils from '../../utilities/LayoutUtils.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'

export default function generateCustomProperties () {
  let { width, gutter } = Config.layout

  return `
    :root {
      --layout-width-min: ${width.min}px;
      --layout-width: ${width.max - width.min}px;
    	--layout-width-max: ${width.max}px;
    	--layout-gutter-x: ${gutter.x};
    	--layout-gutter-x-min: ${LayoutUtils.minGutterXWidth};
    	--layout-gutter-x-max: ${LayoutUtils.maxGutterXWidth};

    	--scale-ratio: ${Config.typography.scaleRatio};

    	/* --block-margin-y: $(block-margin-y); */

    	/* --inline-block-margin-x: 1em; */
    	/* --inline-block-margin-y: $(inline-block-margin-y); */
    	/* --inline-block-padding-x: $(inline-block-padding-x); */
    	/* --inline-block-padding-y: $(inline-block-padding-y); */

    	/* --pill-padding-x: $(pill-padding-x); */
    	/* --pill-border-radius: $(pill-border-radius); */

    	/* Copic Greys */
    	/* Cool greys */
    	--grey-c00 : rgb(232,240,243);
    	--grey-c01 : rgb(225,233,236);
    	--grey-c02 : rgb(218,227,232);
    	--grey-c03 : rgb(204,215,221);
    	--grey-c04 : rgb(192,203,209);
    	--grey-c05 : rgb(146,160,169);
    	--grey-c06 : rgb(125,139,150);
    	--grey-c07 : rgb(99,112,121);
    	--grey-c08 : rgb(83,93,103);
    	--grey-c09 : rgb(60,71,77);
    	--grey-c10 : rgb(33,42,49);

    	/* Neutral greys */
    	--grey-n00 : rgb(237,237,237);
    	--grey-n01 : rgb(226,227,229);
    	--grey-n02 : rgb(218,219,221);
    	--grey-n03 : rgb(209,210,212);
    	--grey-n04 : rgb(188,189,193);
    	--grey-n05 : rgb(169,170,174);
    	--grey-n06 : rgb(148,149,153);
    	--grey-n07 : rgb(119,120,124);
    	--grey-n08 : rgb(99,100,102);
    	--grey-n09 : rgb(76,77,79);
    	--grey-n10 : rgb(44,45,48);

    	/* Toner greys */
    	--grey-t00 : rgb(237,237,237);
    	--grey-t01 : rgb(234,234,234);
    	--grey-t02 : rgb(225,225,223);
    	--grey-t03 : rgb(211,212,207);
    	--grey-t04 : rgb(188,187,185);
    	--grey-t05 : rgb(168,167,163);
    	--grey-t06 : rgb(147,147,145);
    	--grey-t07 : rgb(117,118,119);
    	--grey-t08 : rgb(99,99,97);
    	--grey-t09 : rgb(76,75,73);
    	--grey-t10 : rgb(51,47,46);
    }
  `.trim()
}
