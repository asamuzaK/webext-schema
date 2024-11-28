/* api */
import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';

/* test */
import { Schema } from '../index.js';

describe('Schema', () => {
  it('should be instance of Schema', () => {
    const schema = new Schema();
    assert.strictEqual(schema instanceof Schema, true);
  });
});
