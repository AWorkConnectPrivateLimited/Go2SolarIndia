import { BaseDatabaseService } from './database';
import { supabase } from './client';

export interface DigitalWallet {
  id: string;
  user_id: string;
  balance: number;
  last_updated: string;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference_id: string;
  created_at: string;
}

export class WalletService extends BaseDatabaseService {
  constructor() {
    super('digital_wallet');
  }

  async getUserWallet(userId: string) {
    return this.getByField<DigitalWallet>('user_id', userId);
  }

  async getWalletTransactions(walletId: string) {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WalletTransaction[];
  }

  async addTransaction(walletId: string, transaction: Omit<WalletTransaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;

    // Update wallet balance
    const wallet = await this.getById<DigitalWallet>(walletId);
    const newBalance = transaction.type === 'credit' 
      ? wallet.balance + transaction.amount
      : wallet.balance - transaction.amount;

    await this.update<DigitalWallet>(walletId, {
      balance: newBalance,
      last_updated: new Date().toISOString()
    });

    return data as WalletTransaction;
  }

  async getTransactionHistory(walletId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WalletTransaction[];
  }

  async getWalletStats(walletId: string) {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('type, amount')
      .eq('wallet_id', walletId);

    if (error) throw error;

    const stats = {
      totalCredits: 0,
      totalDebits: 0,
      netBalance: 0,
      transactionCount: data.length
    };

    data.forEach(transaction => {
      if (transaction.type === 'credit') {
        stats.totalCredits += transaction.amount;
      } else {
        stats.totalDebits += transaction.amount;
      }
    });

    stats.netBalance = stats.totalCredits - stats.totalDebits;
    return stats;
  }
} 