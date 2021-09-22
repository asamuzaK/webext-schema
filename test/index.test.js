/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';

/* test */
import { Schema } from '../index.js';

describe('Schema', () => {
  it('should be instance of Schema', () => {
    const schema = new Schema();
    assert.instanceOf(schema, Schema);
  });
});
