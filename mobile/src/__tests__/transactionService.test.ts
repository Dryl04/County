import { transactionService } from '../services/transactions';
import type { Transaction } from '../types';

describe('TransactionService', () => {
  describe('calculateSummary', () => {
    it('should calculate correct summary for empty transactions', () => {
      const result = transactionService.calculateSummary([]);
      
      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.balance).toBe(0);
      expect(result.transactionCount).toBe(0);
      expect(result.incomeCount).toBe(0);
      expect(result.expenseCount).toBe(0);
    });

    it('should calculate correct summary for mixed transactions', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          amount: '1000',
          currency: 'EUR',
          type: 'income',
          occurred_at: '2024-01-15T10:00:00Z',
          budget_id: 'b1',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          amount: '300',
          currency: 'EUR',
          type: 'expense',
          occurred_at: '2024-01-16T10:00:00Z',
          budget_id: 'b1',
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z',
        },
        {
          id: '3',
          amount: '200',
          currency: 'EUR',
          type: 'expense',
          occurred_at: '2024-01-17T10:00:00Z',
          budget_id: 'b1',
          created_at: '2024-01-17T10:00:00Z',
          updated_at: '2024-01-17T10:00:00Z',
        },
      ];

      const result = transactionService.calculateSummary(transactions);
      
      expect(result.totalIncome).toBe(1000);
      expect(result.totalExpenses).toBe(500);
      expect(result.balance).toBe(500);
      expect(result.transactionCount).toBe(3);
      expect(result.incomeCount).toBe(1);
      expect(result.expenseCount).toBe(2);
    });
  });

  describe('calculateMonthlyData', () => {
    it('should return empty array for empty transactions', () => {
      const result = transactionService.calculateMonthlyData([]);
      expect(result).toEqual([]);
    });

    it('should group transactions by month', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          amount: '500',
          currency: 'EUR',
          type: 'income',
          occurred_at: '2024-01-15T10:00:00Z',
          budget_id: 'b1',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          amount: '200',
          currency: 'EUR',
          type: 'expense',
          occurred_at: '2024-01-20T10:00:00Z',
          budget_id: 'b1',
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z',
        },
      ];

      const result = transactionService.calculateMonthlyData(transactions);
      
      expect(result.length).toBe(1);
      expect(result[0].income).toBe(500);
      expect(result[0].expenses).toBe(200);
      expect(result[0].balance).toBe(300);
    });
  });
});
