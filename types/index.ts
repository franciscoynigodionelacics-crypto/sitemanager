// Cart & Basket types
export interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  imageSrc: string;
  imageAlt: string;
}

export interface TrainLawStatus {
  used: number;
  limit: number;
}

// Donation History & Impact types
export type DonationStatus = "Processed" | "Pending";

export interface DonationHistoryItem {
  id: string;
  icon: string;
  title: string;
  date: string;
  amount: string;
  status: DonationStatus;
}

export interface KindredStatus {
  tier: string;
  subtitle: string;
  nextTier: string;
  progressPercent: number;
  pointsAway: number;
}

export interface ImpactRecord {
  livesTouched: number;
  description: string;
}

export interface PointsActivityItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  date: string;
  points: number;
}

export interface RewardsBalance {
  points: number;
  dollarValue: number;
}

// Payment types
export type PaymentMethod = "card" | "wallet" | "bank";
export type CheckoutStepState = "completed" | "active" | "pending";

export interface CheckoutStep {
  number: number;
  label: string;
  state: CheckoutStepState;
}

export interface OrderSummaryItem {
  id: string;
  label: string;
  category: string;
  amount: number;
  currency: string;
}

// Payment Success types
export interface DonationSuccess {
  donorName: string;
  transactionId: string;
  date: string;
  amount: string;
  currency: string;
  causes: string;
  impactImageSrc: string;
  impactQuote: string;
  milestoneText: string;
}

export interface TransactionDetail {
  label: string;
  value: string;
  large: boolean;
}
