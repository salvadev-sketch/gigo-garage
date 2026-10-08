import { useEffect, useState } from "react";
import { api } from "./api";
import type { ShopConfig } from "../../shared/types";

export function useConfig(): ShopConfig {
  const [cfg, setCfg] = useState<ShopConfig>({
    chinaDepositPercent: 50, deliveryFee: 0,
    lumicashNumber: "[LUMICASH NUMBER]", bankName: "[BANK NAME]", bankAccount: "[ACCOUNT NUMBER]", pickupAddress: "[YOUR ADDRESS]",
  });
  useEffect(() => { api<ShopConfig>("/config").then(setCfg).catch(() => undefined); }, []);
  return cfg;
}
