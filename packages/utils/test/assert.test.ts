import { describe, it, expect, vi } from 'vitest';
import { warn, error, assert } from '../src/assert';

describe('Assert Utils', () => {
  describe('warn', () => {
    it('should call console.warn in development', () => {
      const originalWarn = console.warn;
      const mockWarn = vi.fn();
      console.warn = mockWarn;

      warn('Test warning message');

      expect(mockWarn).toHaveBeenCalledWith('[ewColorPicker warning]: Test warning message');

      console.warn = originalWarn;
    });
  });

  describe('error', () => {
    it('should call console.error in development', () => {
      const originalError = console.error;
      const mockError = vi.fn();
      console.error = mockError;

      error('Test error message');

      expect(mockError).toHaveBeenCalledWith('[ewColorPicker error]: Test error message');

      console.error = originalError;
    });
  });

  describe('assert', () => {
    it('should not throw when condition is true', () => {
      expect(() => assert(true, 'This should not throw')).not.toThrow();
    });

    it('should throw when condition is false', () => {
      expect(() => assert(false, 'This should throw')).toThrow('This should throw');
    });

    it('should throw with default message when no message provided', () => {
      expect(() => assert(false)).toThrow('Assertion failed');
    });

    it('should handle complex conditions', () => {
      const value = 5;
      expect(() => assert(value > 0, 'Value should be positive')).not.toThrow();
      expect(() => assert(value < 0, 'Value should be negative')).toThrow('Value should be negative');
    });
  });
}); 