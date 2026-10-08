/** Business settings read from the environment (placeholders until real values are decided). */
export const shopConfig = () => ({
  chinaDepositPercent: Number(process.env.CHINA_DEPOSIT_PERCENT ?? 50),
  deliveryFee: Number(process.env.DELIVERY_FEE ?? 0),
  // Placeholders are shown until the real values are set in the environment.
  lumicashNumber: process.env.LUMICASH_NUMBER ?? "[LUMICASH NUMBER]",
  bankName: process.env.BANK_NAME ?? "[BANK NAME]",
  bankAccount: process.env.BANK_ACCOUNT ?? "[ACCOUNT NUMBER]",
  pickupAddress: process.env.PICKUP_ADDRESS ?? "[YOUR ADDRESS]",
});
