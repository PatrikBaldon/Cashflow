import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber } from '../format';

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('€1.234,56');
      expect(formatCurrency(1000)).toBe('€1.000,00');
      expect(formatCurrency(0)).toBe('€0,00');
    });

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-€1.234,56');
      expect(formatCurrency(-1000)).toBe('-€1.000,00');
    });

    it('handles decimal places correctly', () => {
      expect(formatCurrency(1234.5)).toBe('€1.234,50');
      expect(formatCurrency(1234.567)).toBe('€1.234,57');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toBe('15/01/2024');
    });

    it('handles different date formats', () => {
      const date1 = new Date('2024-12-25T00:00:00Z');
      expect(formatDate(date1)).toBe('25/12/2024');
      
      const date2 = new Date('2024-03-01T15:45:30Z');
      expect(formatDate(date2)).toBe('01/03/2024');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with thousands separator', () => {
      expect(formatNumber(1234)).toBe('1.234');
      expect(formatNumber(1234567)).toBe('1.234.567');
      expect(formatNumber(0)).toBe('0');
    });

    it('handles decimal numbers', () => {
      expect(formatNumber(1234.56)).toBe('1.234,56');
      expect(formatNumber(0.5)).toBe('0,5');
    });

    it('handles negative numbers', () => {
      expect(formatNumber(-1234)).toBe('-1.234');
      expect(formatNumber(-1234.56)).toBe('-1.234,56');
    });
  });
});
