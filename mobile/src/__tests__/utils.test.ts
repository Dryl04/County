import { formatCurrency, formatDate, isValidEmail, isValidPassword, parseAmount, formatPercentage } from '../utils'

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly in EUR', () => {
      const result = formatCurrency(1234.56, 'EUR')
      expect(result).toContain('1')
      expect(result).toContain('234')
    })

    it('should handle zero', () => {
      const result = formatCurrency(0, 'EUR')
      expect(result).toContain('0')
    })

    it('should handle negative numbers', () => {
      const result = formatCurrency(-100, 'EUR')
      expect(result).toContain('100')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate('2024-03-15T10:30:00Z')
      expect(result).toBeTruthy()
    })
  })

  describe('isValidEmail', () => {
    it('should return true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
    })

    it('should return false for invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('should return valid for password with 8+ characters', () => {
      const result = isValidPassword('password123')
      expect(result.valid).toBe(true)
    })

    it('should return invalid for short password', () => {
      const result = isValidPassword('short')
      expect(result.valid).toBe(false)
      expect(result.message).toBeTruthy()
    })
  })

  describe('parseAmount', () => {
    it('should parse string amount', () => {
      expect(parseAmount('123.45')).toBe(123.45)
    })

    it('should return number as is', () => {
      expect(parseAmount(100)).toBe(100)
    })

    it('should return 0 for invalid string', () => {
      expect(parseAmount('invalid')).toBe(0)
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(75.5)).toBe('75.5%')
      expect(formatPercentage(100, 0)).toBe('100%')
    })
  })
})
