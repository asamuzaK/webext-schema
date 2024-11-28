/* api */
import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import sinon from 'sinon';
import { describe, it } from 'mocha';

/* test */
import {
  commander, cleanDirectory, parseCommand
} from '../modules/commander.js';

describe('clean directory', () => {
  it('should not call funtion', () => {
    const stubRm = sinon.stub(fs, 'rmSync');
    const dir = path.resolve('foo');
    cleanDirectory({ dir });
    const { called: rmCalled } = stubRm;
    stubRm.restore();
    assert.strictEqual(rmCalled, false, 'not called');
  });

  it('should call funtion', () => {
    const stubRm = sinon.stub(fs, 'rmSync');
    const stubInfo = sinon.stub(console, 'info');
    const dir = path.resolve('test', 'file');
    cleanDirectory({ dir });
    const { calledOnce: rmCalled } = stubRm;
    const { called: infoCalled } = stubInfo;
    stubRm.restore();
    stubInfo.restore();
    assert.strictEqual(rmCalled, true, 'called');
    assert.strictEqual(infoCalled, false, 'not called');
  });

  it('should call funtion', () => {
    const stubRm = sinon.stub(fs, 'rmSync');
    const stubInfo = sinon.stub(console, 'info');
    const dir = path.resolve('test', 'file');
    cleanDirectory({ dir, info: true });
    const { calledOnce: rmCalled } = stubRm;
    const { calledOnce: infoCalled } = stubInfo;
    stubRm.restore();
    stubInfo.restore();
    assert.strictEqual(rmCalled, true, 'called');
    assert.strictEqual(infoCalled, true, 'called');
  });
});

describe('parse command', () => {
  it('should not parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const i = stubParse.callCount;
    parseCommand();
    assert.strictEqual(stubParse.callCount, i, 'not called');
    stubParse.restore();
  });

  it('should not parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const i = stubParse.callCount;
    parseCommand([]);
    assert.strictEqual(stubParse.callCount, i, 'not called');
    stubParse.restore();
  });

  it('should not parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const i = stubParse.callCount;
    parseCommand([
      'foo',
      'bar',
      'baz'
    ]);
    assert.strictEqual(stubParse.callCount, i, 'not called');
    stubParse.restore();
  });

  it('should parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const stubVer = sinon.stub(commander, 'version');
    const i = stubParse.callCount;
    const j = stubVer.callCount;
    parseCommand([
      'foo',
      'bar',
      '-v'
    ]);
    assert.strictEqual(stubParse.callCount, i + 1, 'called');
    assert.strictEqual(stubVer.callCount, j + 1, 'called');
    stubParse.restore();
    stubVer.restore();
  });

  it('should parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const stubVer = sinon.stub(commander, 'version');
    const spyCmd = sinon.spy(commander, 'command');
    const i = stubParse.callCount;
    const j = stubVer.callCount;
    const k = spyCmd.callCount;
    parseCommand([
      'foo',
      'bar',
      'clean'
    ]);
    assert.strictEqual(stubParse.callCount, i + 1, 'called');
    assert.strictEqual(stubVer.callCount, j + 1, 'called');
    assert.strictEqual(spyCmd.callCount, k + 1, 'called');
    stubParse.restore();
    stubVer.restore();
    spyCmd.restore();
  });

  it('should parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const stubVer = sinon.stub(commander, 'version');
    const spyCmd = sinon.spy(commander, 'command');
    const i = stubParse.callCount;
    const j = stubVer.callCount;
    const k = spyCmd.callCount;
    parseCommand([
      'foo',
      'bar',
      'update'
    ]);
    assert.strictEqual(stubParse.callCount, i + 1, 'called');
    assert.strictEqual(stubVer.callCount, j + 1, 'called');
    assert.strictEqual(spyCmd.callCount, k + 1, 'called');
    stubParse.restore();
    stubVer.restore();
    spyCmd.restore();
  });
});
