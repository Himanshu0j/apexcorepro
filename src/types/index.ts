export type OrderStatus =
  | 'AWAITING_PAYMENT'
  | 'VERIFICATION_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_REJECTED'
  | 'KEY_ISSUED';

export interface Order {
  id: string; // e.g., "ORD-2026-89421"
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  productName: string;
  orderDescription: string;
  priceUsd: number;
  amountUsdt: number;
  network: 'TRON (TRC20)';
  merchantAddress: string;
  
  // Customer submission details
  customerName?: string;
  customerEmail?: string;
  txHash?: string;
  amountSent?: number;
  senderAddress?: string;
  screenshotUrl?: string; // Base64 or uploaded URL
  customerNotes?: string;
  submittedAt?: string;

  // Status & Fulfillment
  status: OrderStatus;
  activationKey?: string;
  rejectionReason?: string;
  
  // Audit & Verification
  verificationType?: 'AUTOMATIC_TRONGRID' | 'MANUAL_ADMIN';
  verifiedAt?: string;
  verificationLogs?: string[];
  blockchainData?: {
    blockNumber?: number;
    confirmedAt?: string;
    contractAddress?: string;
    actualAmount?: number;
    tronscanUrl?: string;
  };
}

export interface LicenseKeyItem {
  id: string;
  key: string;
  status: 'AVAILABLE' | 'ISSUED';
  orderId?: string;
  issuedToEmail?: string;
  issuedAt?: string;
  createdAt: string;
}

export interface SystemSettings {
  toolName: string;
  productName: string;
  productDescription: string;
  priceUsd: number;
  priceUsdt: number;
  merchantWalletAddress: string;
  network: string;
  usdtContractAddress: string;
  supportEmail: string;
  companyName: string;
  manualReviewEstimatedMinutes: number;
  deliveryTimeframe: string;
  enableAutomaticTronGridCheck: boolean;
  tronGridApiKey?: string;
}

export interface CreateOrderRequest {
  customerEmail?: string;
  customerName?: string;
}

export interface SubmitTransactionRequest {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  txHash: string;
  amountSent: number;
  senderAddress?: string;
  screenshotBase64?: string;
  confirmedNetwork: boolean;
  agreedToTerms: boolean;
}

export interface AdminStats {
  totalOrders: number;
  awaitingPayment: number;
  verificationPending: number;
  paymentConfirmed: number;
  paymentRejected: number;
  keysIssued: number;
  totalVolumeUsdt: number;
  availableKeysCount: number;
}
