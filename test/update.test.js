/* api */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sinon from 'sinon';
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { MockAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici';

/* test */
import {
  ESR_VER,
  commander, createUnifiedSchema, fetchText, getAllSchemaData, getChannelUrl,
  getFileList, getListedSchemaData, getMailExtSchemaData, getSchemaData,
  parseCommand, saveSchemaFile, updateSchemas
} from '../modules/update.js';

describe('fetch text', () => {
  const globalDispatcher = getGlobalDispatcher();
  const mockAgent = new MockAgent();
  beforeEach(() => {
    setGlobalDispatcher(mockAgent);
    mockAgent.disableNetConnect();
  });
  afterEach(() => {
    mockAgent.enableNetConnect();
    setGlobalDispatcher(globalDispatcher);
  });

  it('should throw', async () => {
    await fetchText().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should throw', async () => {
    const url = new URL('https://example.com');
    mockAgent.get(url.origin).intercept({ path: url.pathname, method: 'GET' })
      .reply(404);
    await fetchText('https://example.com').catch(e => {
      assert.instanceOf(e, Error, 'error');
      assert.strictEqual(e.message,
        'Network response was not ok. status: 404');
    });
  });

  it('should get result', async () => {
    const url = new URL('https://example.com');
    mockAgent.get(url.origin).intercept({ path: url.pathname, method: 'GET' })
      .reply(200, 'foo');
    const res = await fetchText('https://example.com');
    assert.strictEqual(res, 'foo', 'result');
  });
});

describe('get channel url', () => {
  it('should get result', () => {
    const res = getChannelUrl();
    assert.strictEqual(
      res, 'https://hg.mozilla.org/releases/mozilla-beta/raw-file/tip/',
      'result'
    );
  });

  it('should get result', () => {
    const res = getChannelUrl('beta');
    assert.strictEqual(
      res, 'https://hg.mozilla.org/releases/mozilla-beta/raw-file/tip/',
      'result'
    );
  });

  it('should get result', () => {
    const res = getChannelUrl('esr');
    assert.strictEqual(
      res,
      `https://hg.mozilla.org/releases/mozilla-esr${ESR_VER}/raw-file/tip/`,
      'result'
    );
  });

  it('should get result', () => {
    const res = getChannelUrl('central');
    assert.strictEqual(
      res, 'https://hg.mozilla.org/mozilla-central/raw-file/tip/',
      'result'
    );
  });

  it('should get result', () => {
    const res = getChannelUrl('mail');
    assert.strictEqual(
      res, 'https://hg.mozilla.org/comm-central/raw-file/tip/',
      'result'
    );
  });

  it('should get result', () => {
    const res = getChannelUrl('release');
    assert.strictEqual(
      res, 'https://hg.mozilla.org/releases/mozilla-release/raw-file/tip/',
      'result'
    );
  });
});

describe('get schema data', () => {
  const globalDispatcher = getGlobalDispatcher();
  const mockAgent = new MockAgent();
  beforeEach(() => {
    setGlobalDispatcher(mockAgent);
    mockAgent.disableNetConnect();
  });
  afterEach(() => {
    mockAgent.enableNetConnect();
    setGlobalDispatcher(globalDispatcher);
  });

  it('should throw', async () => {
    await getSchemaData().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should throw', async () => {
    await getSchemaData('foo').catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should get object', async () => {
    const url = new URL('https://example.com/foo.json');
    mockAgent.get(url.origin).intercept({ path: url.pathname, method: 'GET' })
      .reply(200, '{ "foo": [ "bar" ] }');
    const res = await getSchemaData('foo.json', 'https://example.com');
    assert.deepEqual(res, {
      file: 'foo.json',
      schema: {
        foo: ['bar']
      }
    }, 'result');
  });
});

describe('get schema file list from jar manifest', () => {
  const globalDispatcher = getGlobalDispatcher();
  const mockAgent = new MockAgent();
  beforeEach(() => {
    setGlobalDispatcher(mockAgent);
    mockAgent.disableNetConnect();
  });
  afterEach(() => {
    mockAgent.enableNetConnect();
    setGlobalDispatcher(globalDispatcher);
  });

  it('should throw', async () => {
    await getFileList().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should get array', async () => {
    const url = new URL('https://example.com/jar.mn');
    mockAgent.get(url.origin).intercept({ path: url.pathname, method: 'GET' })
      .reply(200, '# comment\n\ntoolkit.jar:\n% content extensions %content/extensions/\n    content/extensions/schemas/alarms.json\n    content/extensions/schemas/browser_settings.json\n#ifndef ANDROID\n    content/extensions/schemas/geckoProfiler.json\n#endif\n    content/extensions/schemas/i18n.json\n');
    const res = await getFileList('https://example.com');
    assert.deepEqual(res, [
      'alarms.json',
      'browser_settings.json',
      'geckoProfiler.json',
      'i18n.json'
    ], 'result');
  });
});

describe('get all schema data', () => {
  const globalDispatcher = getGlobalDispatcher();
  const mockAgent = new MockAgent();
  beforeEach(() => {
    setGlobalDispatcher(mockAgent);
    mockAgent.disableNetConnect();
  });
  afterEach(() => {
    mockAgent.enableNetConnect();
    setGlobalDispatcher(globalDispatcher);
  });

  it('should throw', async () => {
    await getAllSchemaData().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should get array', async () => {
    const url = new URL('https://example.com');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({ path: '/jar.mn', method: 'GET' })
      .reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n');
    mockPool.intercept({ path: '/foo.json', method: 'GET' })
      .reply(200, '{ "foo": "foobar" }');
    mockPool.intercept({ path: '/bar.json', method: 'GET' })
      .reply(200, '{ "baz": "qux" }');
    const res = await getAllSchemaData('https://example.com/');
    assert.deepEqual(res, [
      {
        file: 'foo.json',
        schema: {
          foo: 'foobar'
        }
      },
      {
        file: 'bar.json',
        schema: {
          baz: 'qux'
        }
      }
    ], 'result');
  });
});

describe('get listed schema data', () => {
  const globalDispatcher = getGlobalDispatcher();
  const mockAgent = new MockAgent();
  beforeEach(() => {
    setGlobalDispatcher(mockAgent);
    mockAgent.disableNetConnect();
  });
  afterEach(() => {
    mockAgent.enableNetConnect();
    setGlobalDispatcher(globalDispatcher);
  });

  it('should throw', async () => {
    await getListedSchemaData().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should throw', async () => {
    await getListedSchemaData('foo').catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected Array but got Undefined.');
    });
  });

  it('should get array', async () => {
    const url = new URL('https://example.com');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({ path: '/foo.json', method: 'GET' })
      .reply(200, '{ "foo": "foobar" }');
    mockPool.intercept({ path: '/bar.json', method: 'GET' })
      .reply(200, '{ "baz": "qux" }');
    const res = await getListedSchemaData('https://example.com/',
      ['foo.json', 'bar.json']);
    assert.deepEqual(res, [
      {
        file: 'foo.json',
        schema: {
          foo: 'foobar'
        }
      },
      {
        file: 'bar.json',
        schema: {
          baz: 'qux'
        }
      }
    ], 'result');
  });
});

describe('get MailExtensions schema data', () => {
  const globalDispatcher = getGlobalDispatcher();
  const mockAgent = new MockAgent();
  beforeEach(() => {
    setGlobalDispatcher(mockAgent);
    mockAgent.disableNetConnect();
  });
  afterEach(() => {
    mockAgent.enableNetConnect();
    setGlobalDispatcher(globalDispatcher);
  });

  it('should throw', async () => {
    await getMailExtSchemaData().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should get array', async () => {
    const url = new URL('https://example.com');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({ path: '/jar.mn', method: 'GET' })
      .reply(200, '# comment\n\nmessenger.jar:\n% content/messenger/ext-mail.json\n    content/messenger/schemas/accounts.json\n    content/messenger/schemas/browserAction.json\n    content/messenger/schemas/commands.json\n    content/messenger/schemas/pkcs11.json\n');
    mockPool.intercept({ path: '/schemas/accounts.json', method: 'GET' })
      .reply(200, '{ "foo": "foobar" }');
    mockPool.intercept({ path: '/schemas/browserAction.json', method: 'GET' })
      .reply(200, '{ "bar": "baz" }');
    const res = await getMailExtSchemaData('https://example.com/');
    assert.deepEqual(res, [
      {
        file: 'accounts.json',
        schema: {
          foo: 'foobar'
        }
      },
      {
        file: 'browserAction.json',
        schema: {
          bar: 'baz'
        }
      }
    ], 'result');
  });
});

describe('create unified schema', () => {
  it('should get object', async () => {
    const stubAll = sinon.stub(Promise, 'all').resolves([]);
    const res = await createUnifiedSchema();
    stubAll.restore();
    assert.deepEqual(res, {}, 'result');
  });

  it('should get object', async () => {
    const stubAll = sinon.stub(Promise, 'all').resolves([]);
    const res = await createUnifiedSchema('mail');
    stubAll.restore();
    assert.deepEqual(res, {}, 'result');
  });
});

describe('save schema file', () => {
  it('should throw', async () => {
    await saveSchemaFile().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should create file', async () => {
    const stubAll = sinon.stub(Promise, 'all').resolves([
      [
        {
          file: 'foo',
          schema: {
            foo: 'bar'
          }
        }
      ],
      [
        {
          file: 'baz',
          schema: {
            baz: 'qux'
          }
        }
      ]
    ]);
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'schemas', 'mail', 'mailext.json');
    const res = await saveSchemaFile('mail');
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubAll.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j, 'info');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should create file', async () => {
    const stubAll = sinon.stub(Promise, 'all').resolves([
      [
        {
          file: 'foo',
          schema: {
            foo: 'bar'
          }
        }
      ],
      [
        {
          file: 'baz',
          schema: {
            baz: 'qux'
          }
        }
      ]
    ]);
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'schemas', 'mail', 'mailext.json');
    const res = await saveSchemaFile('mail', true);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    stubAll.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j + 1, 'info');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should create file', async () => {
    const stubAll = sinon.stub(Promise, 'all').resolves([
      [
        {
          file: 'foo',
          schema: {
            foo: 'bar'
          }
        }
      ],
      [
        {
          file: 'baz',
          schema: {
            baz: 'qux'
          }
        }
      ]
    ]);
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'schemas', 'release', 'webext.json');
    const res = await saveSchemaFile('release');
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubAll.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j, 'info');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should create file', async () => {
    const stubAll = sinon.stub(Promise, 'all').resolves([
      [
        {
          file: 'foo',
          schema: {
            foo: 'bar'
          }
        }
      ],
      [
        {
          file: 'baz',
          schema: {
            baz: 'qux'
          }
        }
      ]
    ]);
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath =
      path.join(process.cwd(), 'schemas', 'release', 'webext.json');
    const res = await saveSchemaFile('release', true);
    const { callCount: writeCallCount } = stubWrite;
    const { callCount: infoCallCount } = stubInfo;
    stubInfo.restore();
    stubWrite.restore();
    stubAll.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j + 1, 'info');
    assert.strictEqual(res, filePath, 'result');
  });
});

describe('update schemas files', () => {
  it('should call function', async () => {
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        status: 'resolved'
      },
      {
        status: 'resolved'
      },
      {
        reason: new Error('error'),
        status: 'rejected'
      },
      {
        reason: new Error('error'),
        status: 'rejected'
      },
      {
        status: 'resolved'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    await updateSchemas();
    const { callCount: traceCallCount } = stubTrace;
    stubAll.restore();
    stubTrace.restore();
    assert.strictEqual(traceCallCount, i + 2, 'trace');
  });

  it('should not call function', async () => {
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        status: 'resolved'
      },
      {
        status: 'resolved'
      },
      {
        status: 'resolved'
      },
      {
        status: 'resolved'
      },
      {
        status: 'resolved'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    await updateSchemas();
    const { callCount: traceCallCount } = stubTrace;
    stubAll.restore();
    stubTrace.restore();
    assert.strictEqual(traceCallCount, i, 'trace');
  });

  it('should call function', async () => {
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        reason: new Error('error'),
        status: 'rejected'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const opt = {
      channel: 'beta'
    };
    await updateSchemas(opt);
    const { callCount: traceCallCount } = stubTrace;
    stubAll.restore();
    stubTrace.restore();
    assert.strictEqual(traceCallCount, i + 1, 'trace');
  });

  it('should not call function', async () => {
    const stubAll = sinon.stub(Promise, 'allSettled').resolves([
      {
        status: 'resolved'
      }
    ]);
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const opt = {
      channel: 'beta'
    };
    await updateSchemas(opt);
    const { callCount: traceCallCount } = stubTrace;
    stubAll.restore();
    stubTrace.restore();
    assert.strictEqual(traceCallCount, i, 'trace');
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
    parseCommand(['foo', 'bar', 'baz']);
    assert.strictEqual(stubParse.callCount, i, 'not called');
    stubParse.restore();
  });

  it('should parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const stubVer = sinon.stub(commander, 'version');
    const i = stubParse.callCount;
    const j = stubVer.callCount;
    parseCommand(['foo', 'bar', '-v']);
    assert.strictEqual(stubParse.callCount, i + 1, 'called');
    assert.strictEqual(stubVer.callCount, j + 1, 'called');
    stubParse.restore();
    stubVer.restore();
  });
});
