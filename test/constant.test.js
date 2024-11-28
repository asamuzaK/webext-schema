/* api */
import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';
import { isString } from '../modules/common.js';

/* test */
import { CHAR, INDENT, IS_WIN } from '../modules/constant.js';

describe('string constants', () => {
  it('should get string', () => {
    const arr = [CHAR];
    arr.forEach(i => {
      assert.strictEqual(isString(i), true);
    });
  });
});

describe('number constants', () => {
  it('should get number', () => {
    const arr = [INDENT];
    arr.forEach(i => {
      assert.strictEqual(typeof i, 'number');
    });
  });
});

describe('boolean constants', () => {
  it('should get boolean', () => {
    const arr = [IS_WIN];
    arr.forEach(i => {
      assert.strictEqual(typeof i, 'boolean');
    });
  });
});
