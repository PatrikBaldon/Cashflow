import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatDateTime, formatDateForInput, getTodayString } from '../format';

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toMatch(/1[.\s]234,56.*€/);
      expect(formatCurrency(1000)).toMatch(/1[.\s]000,00.*€/);
      expect(formatCurrency(0)).toMatch(/0,00.*€/);
    });

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toMatch(/-1[.\s]234,56.*€/);
      expect(formatCurrency(-1000)).toMatch(/-1[.\s]000,00.*€/);
    });

    it('handles decimal places correctly', () => {
      expect(formatCurrency(1234.5)).toMatch(/1[.\s]234,50.*€/);
      expect(formatCurrency(1234.567)).toMatch(/1[.\s]234,57.*€/);
    });
  });

  describe('formatDate', () => {
    it('formats date string correctly', () => {
      expect(formatDate('2024-01-15T10:30:00Z')).toBe('15/01/2024');
    });

    it('handles different date formats', () => {
      expect(formatDate('2024-12-25T00:00:00Z')).toBe('25/12/2024');
      expect(formatDate('2024-03-01T15:45:30Z')).toBe('01/03/2024');
    });

    it('handles invalid date strings', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date');
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      // Il test potrebbe fallire a causa del fuso orario, quindi testiamo solo la struttura
      const result = formatDateTime('2024-01-15T10:30:00Z');
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
    });
  });

  describe('formatDateForInput', () => {
    it('formats date for input field', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDateForInput(date)).toBe('2024-01-15');
    });
  });

  describe('getTodayString', () => {
    it('returns today date in input format', () => {
      const today = getTodayString();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
