import { SystemSettings } from '@/types';

export interface TronVerificationResult {
  verified: boolean;
  blockNumber?: number;
  confirmedAt?: string;
  actualAmountUsdt?: number;
  senderAddress?: string;
  recipientAddress?: string;
  contractAddress?: string;
  isOfficialUsdtContract?: boolean;
  tronscanUrl: string;
  logs: string[];
  failureReason?: string;
}

export const OFFICIAL_USDT_TRC20_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

/**
 * Validates a TRON address format (Base58, begins with T, 34 chars)
 */
export function isValidTronAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const clean = address.trim();
  // Standard Tron Base58 address: 34 characters starting with T, Base58 alphabet (no 0, O, I, l)
  const tronRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
  return tronRegex.test(clean);
}

/**
 * Validates a TRON transaction hash (64 hex characters, optional 0x prefix)
 */
export function isValidTxHash(hash: string): boolean {
  if (!hash || typeof hash !== 'string') return false;
  const clean = hash.trim().replace(/^0x/i, '');
  return /^[0-9a-fA-F]{64}$/.test(clean);
}

/**
 * Normalizes a transaction hash for consistency
 */
export function normalizeTxHash(hash: string): string {
  return hash.trim().replace(/^0x/i, '').toLowerCase();
}

/**
 * Verifies a TRC20 USDT transaction on the TRON blockchain.
 * Uses TronGrid and TronScan public endpoints with timeout safety.
 */
export async function verifyTronTransaction(
  rawHash: string,
  settings: SystemSettings,
  expectedAmount = 200
): Promise<TronVerificationResult> {
  const txHash = normalizeTxHash(rawHash);
  const tronscanUrl = `https://tronscan.org/#/transaction/${txHash}`;
  const logs: string[] = [];

  logs.push(`Initiating TRON blockchain verification for tx: ${txHash}`);

  if (!isValidTxHash(txHash)) {
    return {
      verified: false,
      tronscanUrl,
      logs: [...logs, 'Transaction hash format is invalid (must be 64 hexadecimal characters).'],
      failureReason: 'Invalid transaction hash format',
    };
  }

  // Attempt 1: Query TronScan API for TRC20 transfer details
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://apilist.tronscanapi.com/api/transaction-info?hash=${txHash}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ApexCore-TRC20-Validator/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      logs.push(`TronScan response received (HTTP ${res.status})`);

      if (data && data.hash) {
        const contractRet = data.contractRet;
        const confirmed = data.confirmed === true;
        const block = data.block;
        const timestamp = data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString();

        logs.push(`Block: ${block || 'N/A'}, Confirmed: ${confirmed}, ContractRet: ${contractRet}`);

        if (contractRet !== 'SUCCESS') {
          return {
            verified: false,
            tronscanUrl,
            logs: [...logs, `Transaction execution was not successful. Contract status: ${contractRet}`],
            failureReason: `Transaction execution failed on TRON with status: ${contractRet}`,
          };
        }

        // Check TRC20 token transfers
        const trc20Transfers = data.trc20TransferInfo || [];
        if (trc20Transfers.length > 0) {
          for (const transfer of trc20Transfers) {
            const contractAddr = transfer.contract_address;
            const toAddress = transfer.to_address;
            const fromAddress = transfer.from_address;
            // USDT has 6 decimals on Tron
            const decimals = transfer.decimals || 6;
            const rawAmount = parseFloat(transfer.amount_str || '0');
            const tokenAmount = rawAmount / Math.pow(10, decimals);

            logs.push(
              `TRC20 Transfer: ${tokenAmount} ${transfer.symbol || 'tokens'} to ${toAddress} (Contract: ${contractAddr})`
            );

            const isUsdtContract = contractAddr === OFFICIAL_USDT_TRC20_CONTRACT;
            const matchesMerchant =
              toAddress.toLowerCase() === settings.merchantWalletAddress.toLowerCase();
            const amountMatches = tokenAmount >= expectedAmount - 0.05; // 0.05 tolerance for rounding

            if (isUsdtContract && matchesMerchant && amountMatches) {
              logs.push(
                `✓ Verified: Exactly ${tokenAmount} USDT transferred to merchant address on official USDT TRC20 contract.`
              );
              return {
                verified: true,
                blockNumber: block,
                confirmedAt: timestamp,
                actualAmountUsdt: tokenAmount,
                senderAddress: fromAddress,
                recipientAddress: toAddress,
                contractAddress: contractAddr,
                isOfficialUsdtContract: true,
                tronscanUrl,
                logs,
              };
            }
          }
        }
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network lookup skipped';
    logs.push(`TronScan check note: ${msg}`);
  }

  // Attempt 2: Query TronGrid API as fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const tronGridHeaders: Record<string, string> = {
      Accept: 'application/json',
    };
    if (settings.tronGridApiKey) {
      tronGridHeaders['TRON-PRO-API-KEY'] = settings.tronGridApiKey;
    }

    const res = await fetch(`https://api.trongrid.io/v1/transactions/${txHash}`, {
      headers: tronGridHeaders,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      logs.push(`TronGrid response received`);

      if (data && data.data && data.data.length > 0) {
        const tx = data.data[0];
        const ret = tx.ret && tx.ret[0];
        if (ret && ret.contractRet === 'SUCCESS') {
          logs.push(`TronGrid confirmed transaction success.`);
        }
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network lookup skipped';
    logs.push(`TronGrid check note: ${msg}`);
  }

  // If we couldn't automatically verify live (due to network delay, recent broadcast, or test transaction),
  // return transparent verification pending status with full logs
  logs.push(
    `Automatic on-chain verification inconclusive or pending network propagation. Queued for standard manual verification.`
  );

  return {
    verified: false,
    tronscanUrl,
    logs,
    failureReason: 'Transaction pending confirmation or requires administrative audit.',
  };
}
