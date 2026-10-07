/** Business settings read from the environment (placeholders until real values are decided). */
export const shopConfig = () => ({
  chinaDepositPercent: Number(process.env.CHINA_DEPOSIT_PERCENT ?? 50),
  deliveryFee: Number(process.env.DELIVERY_FEE ?? 0),
});
