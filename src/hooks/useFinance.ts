import { useState, useEffect } from 'react';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string
  type: 'income' | 'expense';
  category: string;
}

export interface FinanceData {
  transactions: Transaction[];
  monthlyLimit: number;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  setMonthlyLimit: (limit: number) => void;
  getBalance: () => number;
  getTotalExpenses: () => number;
  getMonthlyExpenses: () => { month: string; amount: number }[];
}

const STORAGE_KEY = 'finsmart_data_v1';

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).transactions : [];
  });

  const [monthlyLimit, setMonthlyLimitState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).monthlyLimit : 2000; // Default limit
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, monthlyLimit }));
  }, [transactions, monthlyLimit]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const setMonthlyLimit = (limit: number) => {
    setMonthlyLimitState(limit);
  };

  const getBalance = () => {
    return transactions.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  };

  const getTotalExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const getMonthlyExpenses = () => {
    // Simple aggregation for the last 6 months
    const result = new Map<string, number>();
    const now = new Date();
    
    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('pt-BR', { month: 'short' });
      result.set(key, 0);
    }

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const d = new Date(t.date);
        // Only include if within the last ~6 months window roughly
        const key = d.toLocaleString('pt-BR', { month: 'short' });
        if (result.has(key)) {
          result.set(key, (result.get(key) || 0) + t.amount);
        }
      }
    });

    return Array.from(result.entries()).map(([month, amount]) => ({ month, amount }));
  };

  return {
    transactions,
    monthlyLimit,
    addTransaction,
    deleteTransaction,
    setMonthlyLimit,
    getBalance,
    getTotalExpenses,
    getMonthlyExpenses
  };
}
