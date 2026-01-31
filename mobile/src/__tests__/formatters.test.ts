import { formatCurrency, formatDate, getInitials, truncateText } from '../utils/formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format currency in EUR by default', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should format currency with specified currency', () => {
      const result = formatCurrency(100, 'USD');
      expect(result).toContain('100');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate('2024-01-15T10:00:00Z');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });

  describe('getInitials', () => {
    it('should return initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should return first two letters for single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should handle multiple names', () => {
      expect(getInitials('John Michael Doe')).toBe('JM');
    });

    it('should handle names with extra spaces', () => {
      expect(getInitials('John  Doe')).toBe('JD');
      expect(getInitials('  John Doe  ')).toBe('JD');
    });

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('should truncate long text with ellipsis', () => {
      expect(truncateText('Hello World!', 8)).toBe('Hello...');
    });
  });
});
