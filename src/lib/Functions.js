import MathFunctions from './functions/MathFunctions.js'
import UnitFunctions from './functions/UnitFunctions.js'

export default {
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
