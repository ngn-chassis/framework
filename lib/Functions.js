const MathFunctions = require('./functions/MathFunctions.js')
const UnitFunctions = require('./functions/UnitFunctions.js')

const Functions = {
  abs: MathFunctions.absoluteValue,
  cbrt: MathFunctions.cubeRoot,
  ceil: MathFunctions.ceiling,
  eval: MathFunctions.evaluate,
  floor: MathFunctions.floor,
  pow: MathFunctions.exponentPower,
  max: MathFunctions.max,
  min: MathFunctions.min,
  random: MathFunctions.random,
  round: MathFunctions.round,
  sqrt: MathFunctions.squareRoot,
  trunc: MathFunctions.truncate,

  pxToEm: UnitFunctions.pxToEm,
  pxToRem: UnitFunctions.pxToRem,
  emToPx: UnitFunctions.emToPx,
  remToPx: UnitFunctions.remToPx
}

module.exports = Functions
