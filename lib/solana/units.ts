const powBigInt = (base: bigint, exponent: number): bigint => {
  let result = BigInt(1);
  for (let i = 0; i < exponent; i += 1) {
    result *= base;
  }
  return result;
};

export const decimalToBigInt = (amount: number, decimals: number): bigint => {
  const scale = powBigInt(BigInt(10), decimals);
  const amountStr = amount.toString();
  const [integerPartRaw, fractionalRaw = ""] = amountStr.split(".");
  const integerPart = integerPartRaw === "" ? "0" : integerPartRaw;
  const fractionalPart = fractionalRaw.padEnd(decimals, "0").slice(0, decimals);
  const integerValue = BigInt(integerPart);
  const fractionalValue =
    fractionalPart.length > 0 ? BigInt(fractionalPart || "0") : BigInt(0);
  return integerValue * scale + fractionalValue;
};
