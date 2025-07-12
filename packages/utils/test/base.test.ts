import { describe, it, expect } from 'vitest';
import {
  removeAllSpace,
  isString,
  isFunction,
  isUndefined,
  isNull,
  clone,
  extend,
  toArray,
  JSONClone,
  isPromise,
  handleClassName
} from '../src/base';
import {
  isNumber,
  isBoolean,
  isObject,
  isArray
} from '../src/type';

describe('Base Utils', () => {
  describe('removeAllSpace', () => {
    it('should remove all spaces from string', () => {
      expect(removeAllSpace('  hello  world  ')).toBe('helloworld');
      expect(removeAllSpace('no spaces')).toBe('nospaces');
      expect(removeAllSpace('')).toBe('');
    });
  });

  describe('type checking functions', () => {
    it('should check string type', () => {
      expect(isString('hello')).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString('')).toBe(true);
    });

    it('should check number type', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber('123')).toBe(false);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber(Infinity)).toBe(true);
    });

    it('should check boolean type', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean('true')).toBe(false);
    });

    it('should check object type', () => {
      expect(isObject({})).toBe(true);
      expect(isObject([])).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject(() => {})).toBe(false);
    });

    it('should check array type', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray({})).toBe(false);
      expect(isArray('array')).toBe(false);
    });

    it('should check function type', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function() {})).toBe(true);
      expect(isFunction({})).toBe(false);
      expect(isFunction('function')).toBe(false);
    });

    it('should check undefined type', () => {
      expect(isUndefined(undefined)).toBe(true);
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined('')).toBe(false);
    });

    it('should check null type', () => {
      expect(isNull(null)).toBe(true);
      expect(isNull(undefined)).toBe(false);
      expect(isNull('')).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should check if value is empty', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1, 2])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(123)).toBe(123);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
    });

    it('should clone objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('should clone arrays', () => {
      const arr = [1, [2, 3], { a: 4 }];
      const cloned = deepClone(arr);
      
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[1]).not.toBe(arr[1]);
      expect(cloned[2]).not.toBe(arr[2]);
    });

    it('should handle circular references', () => {
      const obj: any = { a: 1 };
      obj.self = obj;
      
      const cloned = deepClone(obj);
      expect(cloned.a).toBe(1);
      expect(cloned.self).toBe(cloned);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(callCount).toBe(0);

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(callCount).toBe(1);
    });

    it('should pass arguments to debounced function', async () => {
      let lastArgs: any[] = [];
      const debouncedFn = debounce((...args: any[]) => {
        lastArgs = args;
      }, 100);

      debouncedFn(1, 2, 3);

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(lastArgs).toEqual([1, 2, 3]);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      let callCount = 0;
      const throttledFn = throttle(() => {
        callCount++;
      }, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(callCount).toBe(1);

      await new Promise(resolve => setTimeout(resolve, 150));
      throttledFn();
      expect(callCount).toBe(2);
    });

    it('should pass arguments to throttled function', async () => {
      let lastArgs: any[] = [];
      const throttledFn = throttle((...args: any[]) => {
        lastArgs = args;
      }, 100);

      throttledFn(1, 2, 3);
      throttledFn(4, 5, 6);

      expect(lastArgs).toEqual([1, 2, 3]);

      await new Promise(resolve => setTimeout(resolve, 150));
      throttledFn(7, 8, 9);
      expect(lastArgs).toEqual([7, 8, 9]);
    });
  });
}); 