// Zen Scan - TonAPI Client

import { TONAPI_BASE_URL, TONAPI_TRANSACTIONS_LIMIT } from '../constants';
import type { AccountInfo, Transaction, TransactionHistory, ContractData } from '../types';

/**
 * Fetches transaction history for a TON address from TonAPI.
 */
export async function getTransactions(
  address: string, 
  limit: number = TONAPI_TRANSACTIONS_LIMIT
): Promise<Transaction[]> {
  const url = `${TONAPI_BASE_URL}/blockchain/accounts/${address}/transactions?limit=${limit}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Address not found');
    }
    throw new Error(`TonAPI error: ${response.status}`);
  }

  const data: TransactionHistory = await response.json();
  return data.transactions || [];
}

/**
 * Fetches account information for a TON address from TonAPI.
 */
export async function getAccountInfo(address: string): Promise<AccountInfo> {
  const url = `${TONAPI_BASE_URL}/accounts/${address}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Address not found');
    }
    throw new Error(`TonAPI error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    address: data.address || address,
    balance: data.balance || '0',
    status: data.status || 'uninit',
    interfaces: data.interfaces || [],
    name: data.name,
    icon: data.icon,
  };
}

/**
 * Fetches all contract data needed for risk analysis.
 */
export async function fetchContractData(address: string): Promise<ContractData> {
  // Fetch both in parallel
  const [accountInfo, transactions] = await Promise.all([
    getAccountInfo(address),
    getTransactions(address),
  ]);

  return {
    address,
    accountInfo,
    transactions,
    fetchedAt: Date.now(),
  };
}

/**
 * Formats transaction data for AI analysis prompt.
 */
export function formatTransactionsForPrompt(transactions: Transaction[]): string {
  if (!transactions || transactions.length === 0) {
    return 'No transactions found';
  }

  return transactions.slice(0, 30).map((tx, index) => {
    const date = new Date(tx.utime * 1000).toISOString();
    const inValue = tx.in_msg?.value ? `${Number(tx.in_msg.value) / 1e9} TON` : '0 TON';
    const outCount = tx.out_msgs?.length || 0;
    const success = tx.success ? '✓' : '✗';
    
    return `${index + 1}. [${date}] ${success} In: ${inValue}, Out msgs: ${outCount}, Fees: ${Number(tx.total_fees) / 1e9} TON`;
  }).join('\n');
}

/**
 * Formats balance from nanotons to TON.
 */
export function formatBalance(balance: string): string {
  const tonValue = Number(balance) / 1e9;
  return tonValue.toFixed(4);
}
