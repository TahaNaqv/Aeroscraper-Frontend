const powBigInt = (base: bigint, exponent: number): bigint => {
  let result = BigInt(1);
  for (let i = 0; i < exponent; i += 1) {
    result *= base;
  }
  return result;
};

export const decimalToBigInt = (amount: number, decimals: number): bigint => {
  const scale = powBigInt(BigInt(10), decimals);

  if (!Number.isFinite(amount)) {
    throw new Error(`Cannot convert non-finite number (${amount}) to BigInt`);
  }

  let amountStr = amount.toString();

  // Handle scientific notation by converting to a fixed-point decimal string
  if (/[eE]/.test(amountStr)) {
    amountStr = amount.toFixed(decimals);
  }

  const [integerPartRaw, fractionalRaw = ""] = amountStr.split(".");
  const integerPart = integerPartRaw === "" ? "0" : integerPartRaw;

  let sanitizedFractional = fractionalRaw.replace(/[^0-9]/g, "");
  sanitizedFractional = sanitizedFractional.padEnd(decimals, "0").slice(0, decimals);

  const integerValue = BigInt(integerPart);
  const fractionalValue =
    sanitizedFractional.length > 0 ? BigInt(sanitizedFractional || "0") : BigInt(0);

  return integerValue * scale + fractionalValue;
};
