/** Checks the decimal values represented by finite JavaScript numbers without a tolerance. */
export function isMultipleOf(instance: number, multipleOf: number): boolean {
  if (
    !Number.isFinite(instance) ||
    !Number.isFinite(multipleOf) ||
    multipleOf <= 0
  ) {
    return false;
  }
  if (Number.isSafeInteger(instance) && Number.isSafeInteger(multipleOf)) {
    return instance % multipleOf === 0;
  }

  const [instanceCoefficient, instanceExponent] = decimalParts(instance);
  const [multipleCoefficient, multipleExponent] = decimalParts(multipleOf);
  const exponent = instanceExponent - multipleExponent;
  return exponent >= 0
    ? (instanceCoefficient * 10n ** BigInt(exponent)) % multipleCoefficient ===
        0n
    : instanceCoefficient % (multipleCoefficient * 10n ** BigInt(-exponent)) ===
        0n;
}

function decimalParts(value: number): [bigint, number] {
  const [mantissa, exponent = '0'] = value.toString().split('e');
  const point = mantissa.indexOf('.');
  return [
    BigInt(mantissa.replace('.', '')),
    Number(exponent) - (point === -1 ? 0 : mantissa.length - point - 1)
  ];
}
