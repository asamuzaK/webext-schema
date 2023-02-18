/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';
import { isString } from '../modules/common.js';

/* test */
import { CHAR, INDENT, IS_WIN } from '../modules/constant.js';

describe('string constants', () => {
  it('should get string', () => {
    const arr = [CHAR];
    arr.forEach(i => {
      assert.isTrue(isString(i));
    });
  });
});

describe('number constants', () => {
  it('should get number', () => {
    const arr = [INDENT];
    arr.forEach(i => {
      assert.isTrue(typeof i === 'number');
    });
  });
});

describe('boolean constants', () => {
  it('should get boolean', () => {
    const arr = [IS_WIN];
    arr.forEach(i => {
      assert.isTrue(typeof i === 'boolean');
    });
  });
});
