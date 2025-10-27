import { Schema, serialize } from 'borsh';

// OpenTroveParams schema (matches Rust struct from IDL)
export class OpenTroveParams {
  loan_amount: bigint;
  collateral_denom: string;
  collateral_amount: bigint;

  constructor(fields: { loan_amount: bigint; collateral_denom: string; collateral_amount: bigint }) {
    this.loan_amount = fields.loan_amount;
    this.collateral_denom = fields.collateral_denom;
    this.collateral_amount = fields.collateral_amount;
  }
}

export const OpenTroveParamsSchema = new Map([
  [
    OpenTroveParams,
    {
      kind: 'struct',
      fields: [
        ['loan_amount', 'u64'],
        ['collateral_denom', 'string'],
        ['collateral_amount', 'u64'],
      ],
    },
  ],
]);

