# ApexCore Pro — USDT TRC20 Payment Collection Portal ($200)

A production-quality, responsive SaaS payment collection and license fulfillment portal built for customers purchasing a **Tool Activation Key ($200 USDT)** via the **TRON (TRC20)** cryptocurrency network.

---

## 🌟 Key Features

### 1. Customer Payment Experience
- **Fintech SaaS Aesthetic**: Deep navy theme (`#090d16`), subtle ambient glow, restrained shadows, clean typography, and zero flashy gimmicks.
- **Dynamic Order Generation**: Unique server-generated order reference (e.g. `ORD-2026-XXXXX`) generated upon session start.
- **Unambiguous Pricing**: Clearly highlights that $200.00 USD equivalent is settled as **exactly 200.00 USDT**.
- **TRON TRC20 Dedicated Wallet Card**:
  - Live scannable QR Code dynamically encoded with the merchant TRON address.
  - Full, untruncated wallet address with one-click **Copy Address** and instant feedback.
  - One-click **Copy Amount** (200 USDT).
  - Explicit network fee advisories (TRX energy/bandwidth) and address verification checklist.
- **Cross-Chain Incompatibility Warning**: Prominent notices warning that funds sent via ERC20, BEP20, Polygon, or Solana cannot be recovered.
- **4-Step Interactive Timeline**: Clear visual steps from order review to key delivery, including honest 15–45 minute verification timeframes.

### 2. Transaction Verification & Queue
- **Robust Form Validation**:
  - Validates 64-hexadecimal character TRON transaction hashes (TxID).
  - Validates email formatting for license key delivery.
  - Limits optional screenshot receipts (PNG, JPG, WEBP under 5MB).
  - Requires checkboxes confirming network selection and audit agreement.
- **Duplicate TxID Protection**: Prevents identical transaction hashes from being submitted across multiple orders.
- **Honest Status Messaging**: Clearly informs customers that submission places their transaction into the audit queue and does not prematurely claim funds are confirmed.

### 3. Real Blockchain Verification & Audit Workflow
- **TRON / TRC20 Smart Contract Verification**:
  - Validates transactions against the official USDT TRC20 Mainnet contract (`TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`).
  - Evaluates confirmed status, recipient matching, and transferred amount (200 USDT with 6 decimal places = 200,000,000 sun).
  - Integrates with TronScan and TronGrid public endpoints with timeout resilience.
  - Seamlessly falls back to transparent administrative review if network propagation is pending.

### 4. License Key Delivery & Order Tracking
- **Dedicated Track Order Portal (`/track`)**:
  - Allows customers to check order progress by Order ID and email.
  - When verified, reveals the authentic cryptographic activation key (e.g. `APEX-XXXX-XXXX-XXXX-XXXX`).
  - One-click copy activation key button.
  - **Download License File (`.txt`)** with software activation instructions.
  - Direct link to view the transaction on TronScan.
  - Clear explanation of rejection reasons if an order is rejected.

### 5. Protected Administrative Control Center (`/admin`)
- **Server-Side Authentication**: Protected by password authentication and secure cookie/token sessions.
- **Real-Time Analytics**:
  - Total Orders, Pending Audits, Confirmed Orders, Keys Issued, Rejected Orders, and USDT Volume.
- **Order Inspection & Actions**:
  - Filter by status and search by Order ID, customer email, or TxID.
  - View submitted hashes, receipt screenshots, and complete audit history.
  - One-click **Check on Blockchain** button to query TRON ledger live.
  - **Approve & Issue Key**: Allocates next unused key from inventory pool or accepts custom key.
  - **Reject Payment**: Requires mandatory reason (e.g. "Sent via ERC20 instead of TRC20").
- **License Key Inventory Pool**:
  - Manage stock of pre-generated activation keys.
  - Bulk replenish keys (one per line).
- **Merchant & Store Settings**:
  - Live configuration of the Merchant TRON TRC20 wallet address with format validation.
  - Configure tool name, price, support email, company identity, and delivery timeframe.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **QR Code**: `qrcode.react` (SVG rendering)
- **Data Persistence**: JSON-backed local file database with file safety (`src/lib/db.ts`)
- **Blockchain Integration**: Public TRON RPC / TronScan & TronGrid APIs

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or 20.x+
- npm, yarn, or pnpm

### Installation

1. Clone or open the repository:
   ```bash
   cd kry
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Build and run production:
   ```bash
   npm run build
   npm run start
   ```

---

## 🚀 Deploying to Render via GitHub

### Option A: 1-Click Blueprint (Recommended)
This repository includes a [`render.yaml`](./render.yaml) file.
1. Create a repository on GitHub (e.g. `kry` or `apexcore-checkout`).
2. Push this codebase to your GitHub repo.
3. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
4. Select your GitHub repository. Render will automatically read `render.yaml`, set up the build command (`npm install && npm run build`), start command (`npm run start`), and default environment variables.
5. Click **Apply**. Your website will be live in ~2 minutes!

### Option B: Standard Web Service
1. In Render, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Environment / Runtime**: `Node`
   - **Branch**: `main` (or `master`)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PUPPETEER_SKIP_DOWNLOAD` = `true`
   - `NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS` = `TYDZS92Wvd18qM8263WRDQsjVp9dGZp4tT`
   - `NEXT_PUBLIC_TOOL_NAME` = `ApexCore Pro`
   - `NEXT_PUBLIC_SUPPORT_EMAIL` = `support@apexcore-software.io`
   - `ADMIN_PASSWORD` = `AdminSecure2026!`
5. Click **Create Web Service**.

---

## 🔐 Environment Variables

| Variable | Description | Default Value |
|---|---|---|
| `NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS` | Merchant TRON (TRC20) address | `TYDZS92Wvd18qM8263WRDQsjVp9dGZp4tT` |
| `NEXT_PUBLIC_TOOL_NAME` | Name of your software tool | `ApexCore Pro` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Support contact email | `support@apexcore-software.io` |
| `ADMIN_PASSWORD` | Master password for `/admin` | `AdminSecure2026!` |
| `TRONGRID_API_KEY` | Optional TronGrid API key | *(empty / public)* |

*Note: The merchant wallet address can also be updated live at any time through the Admin Dashboard under "Store & Merchant Settings".*

---

## 📋 Credentials & Access

- **Customer Portal**: [http://localhost:3000](http://localhost:3000)
- **Track Order Portal**: [http://localhost:3000/track](http://localhost:3000/track)
- **Admin Control Center**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Default Admin Password**: `AdminSecure2026!`

---

## 🛡️ Security & Integrity

- **No False Claims**: Submitting transaction details queues the order for verification. The interface never displays a fake confirmation.
- **No Sensitive Credential Storage**: Private keys, seed phrases, and exchange credentials are never collected or stored.
- **Anti-Spam Rate Limiting**: Built-in IP rate limiter protects submission endpoints from automated abuse.
- **Duplicate Prevention**: Cross-references every TxID against active records before queueing.
