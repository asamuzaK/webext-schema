'use strict';
/* api */
const {
  Schema
} = require('../index');
const { assert } = require('chai');
const { describe, it } = require('mocha');

describe('Schema', () => {
  it('should be instance of Schema', () => {
    const schema = new Schema();
    assert.instanceOf(schema, Schema);
  });
});
