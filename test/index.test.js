/* api */
import { strict as assert } from 'node:assert';
import process from 'node:process';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';

/* test */
import { Schema } from '../index.js';

describe('Schema', () => {
  it('should be instance of Schema', () => {
    const schema = new Schema();
    assert.strictEqual(schema instanceof Schema, true);
  });
});

describe('Process Error Handlers', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'error');
    sandbox.stub(process, 'exit');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('should handle uncaughtException', () => {
    const listeners = process.listeners('uncaughtException');
    const targetListener = listeners.find(fn =>
      fn.toString().includes('Fatal Error (Uncaught Exception)')
    );
    assert.ok(targetListener,
      'Target listener for uncaughtException should be found');
    const testError = new Error('Test Uncaught Exception');
    targetListener(testError);
    assert.strictEqual(console.error.calledOnce, true);
    assert.strictEqual(console.error.firstCall.args[0],
      'Fatal Error (Uncaught Exception):');
    assert.strictEqual(console.error.firstCall.args[1], testError);
    assert.strictEqual(process.exit.calledOnceWithExactly(1), true);
  });

  it('should handle unhandledRejection', () => {
    const listeners = process.listeners('unhandledRejection');
    const targetListener = listeners.find(fn =>
      fn.toString().includes('Fatal Error (Unhandled Rejection)')
    );
    assert.ok(targetListener,
      'Target listener for unhandledRejection should be found');
    const testReason = 'Test Unhandled Rejection';
    targetListener(testReason);
    assert.strictEqual(console.error.calledOnce, true);
    assert.strictEqual(console.error.firstCall.args[0],
      'Fatal Error (Unhandled Rejection):');
    assert.strictEqual(console.error.firstCall.args[1], testReason);
    assert.strictEqual(process.exit.calledOnceWithExactly(1), true);
  });
});
