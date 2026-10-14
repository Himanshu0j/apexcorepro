import fs from 'fs';
import path from 'path';
import { Order, LicenseKeyItem, SystemSettings, AdminStats } from '@/types';
import initialData from '@/data/initial-data.json';

// Storage location: runtime data file
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

interface DatabaseSchema {
  settings: SystemSettings;
  orders: Order[];
  keysPool: LicenseKeyItem[];
}

function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Failed to initialize database file:', error);
  }
}

export function getDatabase(): DatabaseSchema {
  ensureDataFile();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content) as DatabaseSchema;
    }
  } catch (err) {
    console.error('Error reading database file, returning default fallback:', err);
  }
  return initialData as DatabaseSchema;
}

export function saveDatabase(data: DatabaseSchema): void {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// ----------------- Settings Helpers -----------------

export function getSettings(): SystemSettings {
  const db = getDatabase();
  const envMerchant = process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS;
  const envSupportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  const envToolName = process.env.NEXT_PUBLIC_TOOL_NAME;

  return {
    ...db.settings,
    merchantWalletAddress: db.settings.merchantWalletAddress || envMerchant || 'TYDZS92Wvd18qM8263WRDQsjVp9dGZp4tT',
    supportEmail: db.settings.supportEmail || envSupportEmail || 'support@apexcore-software.io',
    toolName: db.settings.toolName || envToolName || 'ApexCore Pro',
  };
}

export function updateSettings(newSettings: Partial<SystemSettings>): SystemSettings {
  const db = getDatabase();
  db.settings = { ...db.settings, ...newSettings };
  saveDatabase(db);
  return db.settings;
}

// ----------------- Orders Helpers -----------------

export function getAllOrders(): Order[] {
  const db = getDatabase();
  // Return sorted newest first
  return [...db.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrderById(id: string): Order | undefined {
  const db = getDatabase();
  return db.orders.find((o) => o.id.toLowerCase() === id.trim().toLowerCase());
}

export function findOrderByTxHash(txHash: string): Order | undefined {
  const db = getDatabase();
  const cleanHash = txHash.trim().toLowerCase();
  return db.orders.find(
    (o) => o.txHash && o.txHash.trim().toLowerCase() === cleanHash && o.status !== 'PAYMENT_REJECTED'
  );
}

export function generateOrderId(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const year = new Date().getFullYear();
  return `ORD-${year}-${randomSuffix}`;
}

export function createOrder(customerEmail?: string, customerName?: string): Order {
  const db = getDatabase();
  const settings = getSettings();
  const newOrder: Order = {
    id: generateOrderId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    productName: settings.productName,
    orderDescription: settings.productDescription,
    priceUsd: settings.priceUsd,
    amountUsdt: settings.priceUsdt,
    network: 'TRON (TRC20)',
    merchantAddress: settings.merchantWalletAddress,
    customerEmail: customerEmail?.trim(),
    customerName: customerName?.trim(),
    status: 'AWAITING_PAYMENT',
    verificationLogs: [`Order initiated: awaiting 200 USDT TRC20 payment`],
  };

  db.orders.push(newOrder);
  saveDatabase(db);
  return newOrder;
}

export function submitOrderTransaction(
  orderId: string,
  submission: {
    customerEmail: string;
    customerName?: string;
    txHash: string;
    amountSent: number;
    senderAddress?: string;
    screenshotUrl?: string;
    notes?: string;
  }
): { success: boolean; order?: Order; error?: string } {
  const db = getDatabase();
  const index = db.orders.findIndex((o) => o.id.toLowerCase() === orderId.trim().toLowerCase());

  if (index === -1) {
    return { success: false, error: 'Order not found' };
  }

  const cleanTxHash = submission.txHash.trim();

  // Validate duplicate TxID
  const duplicate = db.orders.find(
    (o) =>
      o.id !== db.orders[index].id &&
      o.txHash &&
      o.txHash.trim().toLowerCase() === cleanTxHash.toLowerCase() &&
      o.status !== 'PAYMENT_REJECTED'
  );

  if (duplicate) {
    return {
      success: false,
      error: `This transaction hash has already been submitted for order ${duplicate.id}. Each payment may only be credited once.`,
    };
  }

  const now = new Date().toISOString();
  const order = db.orders[index];

  order.customerEmail = submission.customerEmail.trim();
  if (submission.customerName) order.customerName = submission.customerName.trim();
  order.txHash = cleanTxHash;
  order.amountSent = submission.amountSent;
  if (submission.senderAddress) order.senderAddress = submission.senderAddress.trim();
  if (submission.screenshotUrl) order.screenshotUrl = submission.screenshotUrl;
  if (submission.notes) order.customerNotes = submission.notes;
  order.submittedAt = now;
  order.updatedAt = now;
  order.status = 'VERIFICATION_PENDING';

  if (!order.verificationLogs) order.verificationLogs = [];
  order.verificationLogs.push(
    `[${now}] Customer submitted transaction hash ${cleanTxHash} for ${submission.amountSent} USDT. Status moved to VERIFICATION_PENDING.`
  );

  db.orders[index] = order;
  saveDatabase(db);

  return { success: true, order };
}

// ----------------- Fulfillment & Keys -----------------

export function getNextAvailableKey(): LicenseKeyItem | null {
  const db = getDatabase();
  return db.keysPool.find((k) => k.status === 'AVAILABLE') || null;
}

export function generateCryptoLicenseKey(prefix = 'APEX'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (len: number) =>
    Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  return `${prefix}-${segment(4)}-${segment(4)}-${segment(4)}-${segment(4)}`;
}

export function fulfillOrderKey(orderId: string, customKey?: string): { success: boolean; key?: string; error?: string } {
  const db = getDatabase();
  const orderIndex = db.orders.findIndex((o) => o.id.toLowerCase() === orderId.trim().toLowerCase());

  if (orderIndex === -1) {
    return { success: false, error: 'Order not found' };
  }

  const order = db.orders[orderIndex];
  if (order.status === 'KEY_ISSUED' && order.activationKey) {
    return { success: true, key: order.activationKey };
  }

  let allocatedKey: string;

  if (customKey && customKey.trim()) {
    allocatedKey = customKey.trim();
  } else {
    // Try to get from pre-stocked pool
    const keyItem = db.keysPool.find((k) => k.status === 'AVAILABLE');
    if (keyItem) {
      keyItem.status = 'ISSUED';
      keyItem.orderId = order.id;
      keyItem.issuedToEmail = order.customerEmail || 'unknown';
      keyItem.issuedAt = new Date().toISOString();
      allocatedKey = keyItem.key;
    } else {
      // Generate new key and append to pool as ISSUED
      allocatedKey = generateCryptoLicenseKey();
      db.keysPool.push({
        id: `KEY-${Date.now()}`,
        key: allocatedKey,
        status: 'ISSUED',
        orderId: order.id,
        issuedToEmail: order.customerEmail || 'unknown',
        issuedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
  }

  const now = new Date().toISOString();
  order.activationKey = allocatedKey;
  order.status = 'KEY_ISSUED';
  order.verifiedAt = now;
  order.updatedAt = now;
  if (!order.verificationLogs) order.verificationLogs = [];
  order.verificationLogs.push(`[${now}] Activation key issued: ${allocatedKey}`);

  db.orders[orderIndex] = order;
  saveDatabase(db);

  return { success: true, key: allocatedKey };
}

export function rejectOrder(orderId: string, reason: string): { success: boolean; error?: string } {
  const db = getDatabase();
  const orderIndex = db.orders.findIndex((o) => o.id.toLowerCase() === orderId.trim().toLowerCase());

  if (orderIndex === -1) {
    return { success: false, error: 'Order not found' };
  }

  const now = new Date().toISOString();
  const order = db.orders[orderIndex];
  order.status = 'PAYMENT_REJECTED';
  order.rejectionReason = reason;
  order.updatedAt = now;
  if (!order.verificationLogs) order.verificationLogs = [];
  order.verificationLogs.push(`[${now}] Payment rejected by reviewer. Reason: ${reason}`);

  db.orders[orderIndex] = order;
  saveDatabase(db);

  return { success: true };
}

export function addKeysToPool(keys: string[]): { countAdded: number } {
  const db = getDatabase();
  let count = 0;
  const now = new Date().toISOString();

  for (const rawKey of keys) {
    const cleanKey = rawKey.trim();
    if (!cleanKey) continue;
    // Check if key already exists
    const exists = db.keysPool.some((k) => k.key.toUpperCase() === cleanKey.toUpperCase());
    if (!exists) {
      db.keysPool.push({
        id: `KEY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        key: cleanKey,
        status: 'AVAILABLE',
        createdAt: now,
      });
      count++;
    }
  }

  if (count > 0) {
    saveDatabase(db);
  }
  return { countAdded: count };
}

export function getKeysPool(): LicenseKeyItem[] {
  const db = getDatabase();
  return db.keysPool;
}

export function getAdminStats(): AdminStats {
  const db = getDatabase();
  const orders = db.orders;

  return {
    totalOrders: orders.length,
    awaitingPayment: orders.filter((o) => o.status === 'AWAITING_PAYMENT').length,
    verificationPending: orders.filter((o) => o.status === 'VERIFICATION_PENDING').length,
    paymentConfirmed: orders.filter((o) => o.status === 'PAYMENT_CONFIRMED').length,
    paymentRejected: orders.filter((o) => o.status === 'PAYMENT_REJECTED').length,
    keysIssued: orders.filter((o) => o.status === 'KEY_ISSUED').length,
    totalVolumeUsdt: orders
      .filter((o) => o.status === 'KEY_ISSUED' || o.status === 'PAYMENT_CONFIRMED')
      .reduce((acc, curr) => acc + (curr.amountSent || curr.amountUsdt || 200), 0),
    availableKeysCount: db.keysPool.filter((k) => k.status === 'AVAILABLE').length,
  };
}
