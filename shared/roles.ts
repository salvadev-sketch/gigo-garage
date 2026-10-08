/** Staff roles stored as Firebase custom claims (`role`). Customers have no role. */
export const ROLES = ["owner", "shop_staff", "garage_staff"] as const;
export type StaffRole = (typeof ROLES)[number];

/** Which roles may open each dashboard. The owner can open both. */
export const DASHBOARD_ROLES = {
  shop: ["owner", "shop_staff"],
  garage: ["owner", "garage_staff"],
} as const satisfies Record<string, readonly StaffRole[]>;

export const isStaffRole = (v: unknown): v is StaffRole => ROLES.includes(v as StaffRole);
