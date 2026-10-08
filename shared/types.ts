export type PartSource = "shop" | "china";
export type BookingStatus = "pending" | "confirmed" | "in_progress" | "done" | "cancelled";
export type ChinaStatus = "requested" | "quoted" | "ordered" | "shipped" | "arrived" | "ready";
export type PaymentMethod = "lumicash" | "bank";

export interface Part {
  _id: string; name: string; category: string; partNo: string;
  make: string; model: string; years: number[];
  price: number; stock: number; source: PartSource; leadTimeWeeks?: number;
}
export interface Booking {
  _id: string; carId: string; valid: boolean; completedAt?: string; customerName: string; phone: string;
  make: string; model: string; year: number; chassisNo?: string;
  service: string; date: string; time: string; notes?: string; status: BookingStatus;
}
export interface OrderItem { partId: string; name: string; qty: number; price: number; source: PartSource }
export interface Order {
  _id: string; orderNo: string; items: OrderItem[]; customerName: string; phone: string;
  delivery: "pickup" | "delivery"; address?: string;
  payment: PaymentMethod; /** Lumicash/bank transaction reference entered by the customer */ paymentProof?: string;
  subtotal: number; deposit: number; deliveryFee: number; total: number; status: "pending" | "paid" | "done";
}
export interface ShopConfig { chinaDepositPercent: number; deliveryFee: number }
export interface ChinaRequest {
  _id: string; requestNo: string; partNo?: string; photoUrl?: string; vehicle: string; notes?: string;
  phone: string; quote?: number; deposit?: number; status: ChinaStatus;
}
/** Public view of a China request (no phone number). */
export interface ChinaTrack {
  requestNo: string; status: ChinaStatus; partNo?: string; vehicle?: string; quote?: number; deposit?: number;
}

/** Public view of a car in the garage waiting list (no personal data). */
export interface QueueItem {
  carId: string; make?: string; model?: string; year?: number;
  service: string; status: BookingStatus; position: number | null;
  /** false once the car is repaired (done) or the booking is cancelled */
  valid?: boolean;
}
