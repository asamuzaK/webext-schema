/* api */
import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sinon from 'sinon';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { MockAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici';

/* test */
import {
  ESR_VER,
  createUnifiedSchema, fetchText, getAllSchemaData, getChannelUrl, getFileList,
  getListedSchemaData, getMailExtSchemaData, getSchemaData, saveSchemaFile,
  updateSchemas
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
      assert.deepStrictEqual(e,
        new TypeError('Expected String but got Undefined.'));
    });
  });

  it('should throw', async () => {
    const url = new URL('https://example.com');
    mockAgent.get(url.origin).intercept({ path: url.pathname, method: 'GET' })
      .reply(404, {
        ok: false,
        status: 404
      });
    await fetchText('https://example.com').catch(e => {
      assert.deepStrictEqual(e,
        new Error('Network response was not ok. status: 404'));
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
      assert.deepStrictEqual(e,
        new TypeError('Expected String but got Undefined.'));
    });
  });

  it('should throw', async () => {
    await getSchemaData('foo').catch(e => {
      assert.deepStrictEqual(e,
        new TypeError('Expected String but got Undefined.'));
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
      assert.deepStrictEqual(e,
        new TypeError('Expected String but got Undefined.'));
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
      assert.deepStrictEqual(e,
        new TypeError('Expected String but got Undefined.'));
    });
  });

  it('should get array', async () => {
    const stubInfo = sinon.stub(console, 'info');
    const url = new URL('https://example.com');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({ path: '/jar.mn', method: 'GET' })
      .reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n');
    mockPool.intercept({ path: '/foo.json', method: 'GET' })
      .reply(200, '{ "foo": "foobar" }');
    mockPool.intercept({ path: '/bar.json', method: 'GET' })
      .reply(200, '{ "baz": "qux" }');
    const res = await getAllSchemaData('https://example.com/');
    assert.strictEqual(stubInfo.called, false, 'info');
    stubInfo.restore();
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

  it('should get array', async () => {
    const stubInfo = sinon.stub(console, 'info');
    const url = new URL('https://example.com');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({ path: '/jar.mn', method: 'GET' })
      .reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n');
    mockPool.intercept({ path: '/foo.json', method: 'GET' })
      .reply(200, '{ "foo": "foobar" }');
    mockPool.intercept({ path: '/bar.json', method: 'GET' })
      .reply(200, '{ "baz": "qux" }');
    const res = await getAllSchemaData('https://example.com/', true);
    assert.strictEqual(stubInfo.called, true, 'info');
    stubInfo.restore();
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
      assert.deepStrictEqual(e,
        new TypeError('Expected String but got Undefined.'));
    });
  });

  it('should throw', async () => {
    await getListedSchemaData('foo').catch(e => {
      assert.deepStrictEqual(e,
        new TypeError('Expected Array but got Undefined.'));
    });
  });

  it('should get array', async () => {
    const stubInfo = sinon.stub(console, 'info');
    const url = new URL('https://example.com');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({ path: '/foo.json', method: 'GET' })
      .reply(200, '{ "foo": "foobar" }');
    mockPool.intercept({ path: '/bar.json', method: 'GET' })
      .reply(200, '{ "baz": "qux" }');
    const res = await getListedSchemaData('https://example.com/',
      ['foo.json', 'bar.json']);
    assert.strictEqual(stubInfo.called, false, 'info');
    stubInfo.restore();
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

  it('should get array', async () => {
    const stubInfo = sinon.stub(console, 'info');
    const url = new URL('https://example.com');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({ path: '/foo.json', method: 'GET' })
      .reply(200, '{ "foo": "foobar" }');
    mockPool.intercept({ path: '/bar.json', method: 'GET' })
      .reply(200, '{ "baz": "qux" }');
    const res = await getListedSchemaData('https://example.com/',
      ['foo.json', 'bar.json'], true);
    assert.strictEqual(stubInfo.called, true, 'info');
    stubInfo.restore();
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
      assert.deepStrictEqual(e,
        new TypeError('Expected String but got Undefined.'));
    });
  });

  it('should get array', async () => {
    const stubInfo = sinon.stub(console, 'info');
    const url = new URL('https://example.com');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({ path: '/jar.mn', method: 'GET' })
      .reply(200, '# comment\n\nmessenger.jar:\n% content/messenger/ext-mail.json\n    content/messenger/schemas/accounts.json\n    content/messenger/schemas/browserAction.json\n    content/messenger/schemas/commands.json\n    content/messenger/schemas/pkcs11.json\n');
    mockPool.intercept({ path: '/schemas/accounts.json', method: 'GET' })
      .reply(200, '{ "foo": "foobar" }');
    mockPool.intercept({ path: '/schemas/browserAction.json', method: 'GET' })
      .reply(200, '{ "bar": "baz" }');
    const res = await getMailExtSchemaData('https://example.com/');
    assert.strictEqual(stubInfo.called, false, 'info');
    stubInfo.restore();
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

  it('should get array', async () => {
    const stubInfo = sinon.stub(console, 'info');
    const url = new URL('https://example.com');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({ path: '/jar.mn', method: 'GET' })
      .reply(200, '# comment\n\nmessenger.jar:\n% content/messenger/ext-mail.json\n    content/messenger/schemas/accounts.json\n    content/messenger/schemas/browserAction.json\n    content/messenger/schemas/commands.json\n    content/messenger/schemas/pkcs11.json\n');
    mockPool.intercept({ path: '/schemas/accounts.json', method: 'GET' })
      .reply(200, '{ "foo": "foobar" }');
    mockPool.intercept({ path: '/schemas/browserAction.json', method: 'GET' })
      .reply(200, '{ "bar": "baz" }');
    const res = await getMailExtSchemaData('https://example.com/', true);
    assert.strictEqual(stubInfo.called, true, 'info');
    stubInfo.restore();
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

  it('should get object', async () => {
    const stubInfo = sinon.stub(console, 'info');
    const url = new URL('https://hg.mozilla.org');
    const mockPool = mockAgent.get(url.origin);
    const basePath = '/releases/mozilla-beta/raw-file/tip/';
    const browserUrl =
      `${url.origin}${basePath}browser/components/extensions/schemas/`;
    const toolkitUrl =
      `${url.origin}${basePath}toolkit/components/extensions/schemas/`;
    mockPool.intercept({ path: `${browserUrl}jar.mn`, method: 'GET' })
      .reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n');
    mockPool.intercept({ path: `${browserUrl}foo.json`, method: 'GET' })
      .reply(200, '{ "foo": "Foo" }');
    mockPool.intercept({ path: `${browserUrl}bar.json`, method: 'GET' })
      .reply(200, '{ "bar": "Bar" }');
    mockPool.intercept({ path: `${toolkitUrl}jar.mn`, method: 'GET' })
      .reply(200, 'content/extensions/schemas/baz.json\ncontent/extensions/schemas/qux.json\n');
    mockPool.intercept({ path: `${toolkitUrl}baz.json`, method: 'GET' })
      .reply(200, '{ "baz": "Baz" }');
    mockPool.intercept({ path: `${toolkitUrl}qux.json`, method: 'GET' })
      .reply(200, '{ "qux": "Qux" }');
    const res = await createUnifiedSchema();
    assert.strictEqual(stubInfo.called, false, 'info');
    stubInfo.restore();
    assert.deepEqual(res, {
      'foo.json': {
        foo: 'Foo'
      },
      'bar.json': {
        bar: 'Bar'
      },
      'baz.json': {
        baz: 'Baz'
      },
      'qux.json': {
        qux: 'Qux'
      }
    }, 'result');
  });

  it('should get object', async () => {
    const stubInfo = sinon.stub(console, 'info');
    const url = new URL('https://hg.mozilla.org');
    const mockPool = mockAgent.get(url.origin);
    const basePath = '/mozilla-central/raw-file/tip/';
    const browserUrl =
      `${url.origin}${basePath}browser/components/extensions/schemas/`;
    const toolkitUrl =
      `${url.origin}${basePath}toolkit/components/extensions/schemas/`;
    mockPool.intercept({ path: `${browserUrl}jar.mn`, method: 'GET' })
      .reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n');
    mockPool.intercept({ path: `${browserUrl}foo.json`, method: 'GET' })
      .reply(200, '{ "foo": "Foo" }');
    mockPool.intercept({ path: `${browserUrl}bar.json`, method: 'GET' })
      .reply(200, '{ "bar": "Bar" }');
    mockPool.intercept({ path: `${toolkitUrl}jar.mn`, method: 'GET' })
      .reply(200, 'content/extensions/schemas/baz.json\ncontent/extensions/schemas/qux.json\n');
    mockPool.intercept({ path: `${toolkitUrl}baz.json`, method: 'GET' })
      .reply(200, '{ "baz": "Baz" }');
    mockPool.intercept({ path: `${toolkitUrl}qux.json`, method: 'GET' })
      .reply(200, '{ "qux": "Qux" }');
    const res = await createUnifiedSchema('central', true);
    assert.strictEqual(stubInfo.called, true, 'info');
    stubInfo.restore();
    assert.deepEqual(res, {
      'foo.json': {
        foo: 'Foo'
      },
      'bar.json': {
        bar: 'Bar'
      },
      'baz.json': {
        baz: 'Baz'
      },
      'qux.json': {
        qux: 'Qux'
      }
    }, 'result');
  });

  it('should get object', async () => {
    const stubInfo = sinon.stub(console, 'info');
    const url = new URL('https://hg.mozilla.org');
    const mockPool = mockAgent.get(url.origin);
    const basePath = '/mozilla-central/raw-file/tip/';
    const mailBasePath = '/comm-central/raw-file/tip/';
    const browserUrl =
      `${url.origin}${basePath}browser/components/extensions/schemas/`;
    const toolkitUrl =
      `${url.origin}${basePath}toolkit/components/extensions/schemas/`;
    const mailBaseUrl =
      `${url.origin}${mailBasePath}mail/components/extensions/`;
    const mailUrl = `${mailBaseUrl}schemas/`;
    mockPool.intercept({ path: `${browserUrl}commands.json`, method: 'GET' })
      .reply(200, '{ "commands": "Commands" }');
    mockPool.intercept({ path: `${browserUrl}pkcs11.json`, method: 'GET' })
      .reply(200, '{ "pkcs11": "Pkcs11" }');
    mockPool.intercept({
      path: `${toolkitUrl}content_scripts.json`,
      method: 'GET'
    }).reply(200, '{ "content_scripts": "ContentScripts" }');
    mockPool.intercept({ path: `${toolkitUrl}experiments.json`, method: 'GET' })
      .reply(200, '{ "experiments": "Experiments" }');
    mockPool.intercept({ path: `${toolkitUrl}extension.json`, method: 'GET' })
      .reply(200, '{ "extension": "Extension" }');
    mockPool.intercept({ path: `${toolkitUrl}i18n.json`, method: 'GET' })
      .reply(200, '{ "i18n": "I18n" }');
    mockPool.intercept({ path: `${toolkitUrl}management.json`, method: 'GET' })
      .reply(200, '{ "management": "Management" }');
    mockPool.intercept({ path: `${toolkitUrl}permissions.json`, method: 'GET' })
      .reply(200, '{ "permissions": "Permissions" }');
    mockPool.intercept({ path: `${toolkitUrl}runtime.json`, method: 'GET' })
      .reply(200, '{ "runtime": "Runtime" }');
    mockPool.intercept({ path: `${toolkitUrl}theme.json`, method: 'GET' })
      .reply(200, '{ "theme": "Theme" }');
    mockPool.intercept({ path: `${mailBaseUrl}jar.mn`, method: 'GET' })
      .reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n');
    mockPool.intercept({ path: `${mailUrl}foo.json`, method: 'GET' })
      .reply(200, '{ "foo": "Foo" }');
    mockPool.intercept({ path: `${mailUrl}bar.json`, method: 'GET' })
      .reply(200, '{ "bar": "Bar" }');
    const res = await createUnifiedSchema('mail', true);
    assert.strictEqual(stubInfo.called, true, 'info');
    stubInfo.restore();
    assert.deepEqual(res, {
      'commands.json': {
        commands: 'Commands'
      },
      'pkcs11.json': {
        pkcs11: 'Pkcs11'
      },
      'content_scripts.json': {
        content_scripts: 'ContentScripts'
      },
      'experiments.json': {
        experiments: 'Experiments'
      },
      'extension.json': {
        extension: 'Extension'
      },
      'i18n.json': {
        i18n: 'I18n'
      },
      'management.json': {
        management: 'Management'
      },
      'permissions.json': {
        permissions: 'Permissions'
      },
      'runtime.json': {
        runtime: 'Runtime'
      },
      'theme.json': {
        theme: 'Theme'
      },
      'foo.json': {
        foo: 'Foo'
      },
      'bar.json': {
        bar: 'Bar'
      }
    }, 'result');
  });
/*
  it('should get object', async () => {
    const stubAll = sinon.stub(Promise, 'all').resolves([]);
    const stubInfo = sinon.stub(console, 'info');
    const res = await createUnifiedSchema();
    stubAll.restore();
    stubInfo.restore();
    assert.deepEqual(res, {}, 'result');
  });

  it('should get object', async () => {
    const stubAll = sinon.stub(Promise, 'all').resolves([]);
    const stubInfo = sinon.stub(console, 'info');
    const res = await createUnifiedSchema('mail');
    stubAll.restore();
    stubInfo.restore();
    assert.deepEqual(res, {}, 'result');
  });
*/
});

describe('save schema file', () => {
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
    await saveSchemaFile().catch(e => {
      assert.deepStrictEqual(e,
        new TypeError('Expected String but got Undefined.'));
    });
  });

  it('should create file', async () => {
    const url = new URL('https://hg.mozilla.org/mozilla-central/raw-file/tip/');
    const mockPool = mockAgent.get(url.origin);
    const browserItems = [
      'commands.json',
      'pkcs11.json'
    ];
    for (const item of browserItems) {
      mockPool.intercept({
        path: `${url.pathname}browser/components/extensions/schemas/${item}`,
        method: 'GET'
      }).reply(200, `{ "browser": "${item}" }`);
    }
    const toolkitItems = [
      'content_scripts.json', 'experiments.json', 'extension.json', 'i18n.json',
      'management.json', 'permissions.json', 'runtime.json', 'theme.json'
    ];
    for (const item of toolkitItems) {
      mockPool.intercept({
        path: `${url.pathname}toolkit/components/extensions/schemas/${item}`,
        method: 'GET'
      }).reply(200, `{ "toolkit": "${item}" }`);
    }
    mockPool.intercept({
      path: '/comm-central/raw-file/tip/mail/components/extensions/jar.mn',
      method: 'GET'
    }).reply(200, '# comment\n\nmessenger.jar:\n% content/messenger/ext-mail.json\n    content/messenger/schemas/accounts.json\n');
    mockPool.intercept({
      path: '/comm-central/raw-file/tip/mail/components/extensions/schemas/accounts.json',
      method: 'GET'
    }).reply(200, '{ "mail": "accounts.json" }');
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
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j, 'info');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should create file', async () => {
    const url = new URL('https://hg.mozilla.org/mozilla-central/raw-file/tip/');
    const mockPool = mockAgent.get(url.origin);
    const browserItems = [
      'commands.json',
      'pkcs11.json'
    ];
    for (const item of browserItems) {
      mockPool.intercept({
        path: `${url.pathname}browser/components/extensions/schemas/${item}`,
        method: 'GET'
      }).reply(200, `{ "browser": "${item}" }`);
    }
    const toolkitItems = [
      'content_scripts.json', 'experiments.json', 'extension.json', 'i18n.json',
      'management.json', 'permissions.json', 'runtime.json', 'theme.json'
    ];
    for (const item of toolkitItems) {
      mockPool.intercept({
        path: `${url.pathname}toolkit/components/extensions/schemas/${item}`,
        method: 'GET'
      }).reply(200, `{ "toolkit": "${item}" }`);
    }
    mockPool.intercept({
      path: '/comm-central/raw-file/tip/mail/components/extensions/jar.mn',
      method: 'GET'
    }).reply(200, '# comment\n\nmessenger.jar:\n% content/messenger/ext-mail.json\n    content/messenger/schemas/accounts.json\n');
    mockPool.intercept({
      path: '/comm-central/raw-file/tip/mail/components/extensions/schemas/accounts.json',
      method: 'GET'
    }).reply(200, '{ "mail": "accounts.json" }');
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
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j + 12, 'info');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should create file', async () => {
    const url =
      new URL('https://hg.mozilla.org/releases/mozilla-release/raw-file/tip/');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({
      path: `${url.pathname}browser/components/extensions/schemas/jar.mn`,
      method: 'GET'
    }).reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n');
    mockPool.intercept({
      path: `${url.pathname}browser/components/extensions/schemas/foo.json`,
      method: 'GET'
    }).reply(200, '{ "browser": "foo.json" }');
    mockPool.intercept({
      path: `${url.pathname}browser/components/extensions/schemas/bar.json`,
      method: 'GET'
    }).reply(200, '{ "browser": "bar.json" }');
    mockPool.intercept({
      path: `${url.pathname}toolkit/components/extensions/schemas/jar.mn`,
      method: 'GET'
    }).reply(200, 'content/extensions/schemas/baz.json\ncontent/extensions/schemas/qux.json\n');
    mockPool.intercept({
      path: `${url.pathname}toolkit/components/extensions/schemas/baz.json`,
      method: 'GET'
    }).reply(200, '{ "toolkit": "baz.json" }');
    mockPool.intercept({
      path: `${url.pathname}toolkit/components/extensions/schemas/qux.json`,
      method: 'GET'
    }).reply(200, '{ "toolkit": "qux.json" }');
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
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j, 'info');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should create file', async () => {
    const url =
      new URL('https://hg.mozilla.org/releases/mozilla-release/raw-file/tip/');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({
      path: `${url.pathname}browser/components/extensions/schemas/jar.mn`,
      method: 'GET'
    }).reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n');
    mockPool.intercept({
      path: `${url.pathname}browser/components/extensions/schemas/foo.json`,
      method: 'GET'
    }).reply(200, '{ "browser": "foo.json" }');
    mockPool.intercept({
      path: `${url.pathname}browser/components/extensions/schemas/bar.json`,
      method: 'GET'
    }).reply(200, '{ "browser": "bar.json" }');
    mockPool.intercept({
      path: `${url.pathname}toolkit/components/extensions/schemas/jar.mn`,
      method: 'GET'
    }).reply(200, 'content/extensions/schemas/baz.json\ncontent/extensions/schemas/qux.json\n');
    mockPool.intercept({
      path: `${url.pathname}toolkit/components/extensions/schemas/baz.json`,
      method: 'GET'
    }).reply(200, '{ "toolkit": "baz.json" }');
    mockPool.intercept({
      path: `${url.pathname}toolkit/components/extensions/schemas/qux.json`,
      method: 'GET'
    }).reply(200, '{ "toolkit": "qux.json" }');
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
    assert.strictEqual(writeCallCount, i + 1, 'write');
    assert.strictEqual(infoCallCount, j + 5, 'info');
    assert.strictEqual(res, filePath, 'result');
  });
});

describe('update schemas files', () => {
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

  it('should not call function', async () => {
    const url = new URL('https://hg.mozilla.org/mozilla-central/raw-file/tip/');
    const centralPath = url.pathname;
    const betaPath = '/releases/mozilla-beta/raw-file/tip/';
    const releasePath = '/releases/mozilla-release/raw-file/tip/';
    const esrPath = `/releases/mozilla-esr${ESR_VER}/raw-file/tip/`;
    const mailPath = '/comm-central/raw-file/tip/';
    const mockPool = mockAgent.get(url.origin);
    for (const item of [centralPath, betaPath, releasePath, esrPath]) {
      mockPool.intercept({
        path: `${item}browser/components/extensions/schemas/jar.mn`,
        method: 'GET'
      }).reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n');
      mockPool.intercept({
        path: `${item}browser/components/extensions/schemas/foo.json`,
        method: 'GET'
      }).reply(200, '{ "browser": "foo.json" }');
      mockPool.intercept({
        path: `${item}browser/components/extensions/schemas/bar.json`,
        method: 'GET'
      }).reply(200, '{ "browser": "bar.json" }');
      mockPool.intercept({
        path: `${item}toolkit/components/extensions/schemas/jar.mn`,
        method: 'GET'
      }).reply(200, 'content/extensions/schemas/baz.json\ncontent/extensions/schemas/qux.json\n');
      mockPool.intercept({
        path: `${item}toolkit/components/extensions/schemas/baz.json`,
        method: 'GET'
      }).reply(200, '{ "toolkit": "baz.json" }');
      mockPool.intercept({
        path: `${item}toolkit/components/extensions/schemas/qux.json`,
        method: 'GET'
      }).reply(200, '{ "toolkit": "qux.json" }');
    }
    const browserItems = [
      'commands.json',
      'pkcs11.json'
    ];
    for (const item of browserItems) {
      mockPool.intercept({
        path: `${centralPath}browser/components/extensions/schemas/${item}`,
        method: 'GET'
      }).reply(200, `{ "browser": "${item}" }`);
    }
    const toolkitItems = [
      'content_scripts.json', 'experiments.json', 'extension.json', 'i18n.json',
      'management.json', 'permissions.json', 'runtime.json', 'theme.json'
    ];
    for (const item of toolkitItems) {
      mockPool.intercept({
        path: `${centralPath}toolkit/components/extensions/schemas/${item}`,
        method: 'GET'
      }).reply(200, `{ "toolkit": "${item}" }`);
    }
    mockPool.intercept({
      path: `${mailPath}mail/components/extensions/jar.mn`,
      method: 'GET'
    }).reply(200, 'content/messenger/schemas/quux.json\n');
    mockPool.intercept({
      path: `${mailPath}mail/components/extensions/schemas/quux.json`,
      method: 'GET'
    }).reply(200, '{ "mail": "quux.json" }');
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const stubInfo = sinon.stub(console, 'info');
    await updateSchemas();
    const { callCount: traceCallCount } = stubTrace;
    stubWrite.restore();
    stubTrace.restore();
    stubInfo.restore();
    assert.strictEqual(traceCallCount, i, 'trace not called');
  });

  it('should not call function', async () => {
    const url = new URL('https://hg.mozilla.org/mozilla-central/raw-file/tip/');
    const centralPath = url.pathname;
    const betaPath = '/releases/mozilla-beta/raw-file/tip/';
    const releasePath = '/releases/mozilla-release/raw-file/tip/';
    const esrPath = `/releases/mozilla-esr${ESR_VER}/raw-file/tip/`;
    const mailPath = '/comm-central/raw-file/tip/';
    const mockPool = mockAgent.get(url.origin);
    for (const item of [centralPath, betaPath, releasePath, esrPath]) {
      mockPool.intercept({
        path: `${item}browser/components/extensions/schemas/jar.mn`,
        method: 'GET'
      }).reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n');
      mockPool.intercept({
        path: `${item}browser/components/extensions/schemas/foo.json`,
        method: 'GET'
      }).reply(200, '{ "browser": "foo.json" }');
      mockPool.intercept({
        path: `${item}browser/components/extensions/schemas/bar.json`,
        method: 'GET'
      }).reply(200, '{ "browser": "bar.json" }');
      mockPool.intercept({
        path: `${item}toolkit/components/extensions/schemas/jar.mn`,
        method: 'GET'
      }).reply(200, 'content/extensions/schemas/baz.json\ncontent/extensions/schemas/qux.json\n');
      mockPool.intercept({
        path: `${item}toolkit/components/extensions/schemas/baz.json`,
        method: 'GET'
      }).reply(200, '{ "toolkit": "baz.json" }');
      mockPool.intercept({
        path: `${item}toolkit/components/extensions/schemas/qux.json`,
        method: 'GET'
      }).reply(200, '{ "toolkit": "qux.json" }');
    }
    const browserItems = [
      'commands.json',
      'pkcs11.json'
    ];
    for (const item of browserItems) {
      mockPool.intercept({
        path: `${centralPath}browser/components/extensions/schemas/${item}`,
        method: 'GET'
      }).reply(200, `{ "browser": "${item}" }`);
    }
    const toolkitItems = [
      'content_scripts.json', 'experiments.json', 'extension.json', 'i18n.json',
      'management.json', 'permissions.json', 'runtime.json', 'theme.json'
    ];
    for (const item of toolkitItems) {
      mockPool.intercept({
        path: `${centralPath}toolkit/components/extensions/schemas/${item}`,
        method: 'GET'
      }).reply(200, `{ "toolkit": "${item}" }`);
    }
    mockPool.intercept({
      path: `${mailPath}mail/components/extensions/jar.mn`,
      method: 'GET'
    }).reply(200, 'content/messenger/schemas/quux.json\n');
    mockPool.intercept({
      path: `${mailPath}mail/components/extensions/schemas/quux.json`,
      method: 'GET'
    }).reply(400, '{ "ok": false, "status": 400 }');
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const stubInfo = sinon.stub(console, 'info');
    await updateSchemas();
    const { callCount: traceCallCount } = stubTrace;
    stubWrite.restore();
    stubTrace.restore();
    stubInfo.restore();
    assert.strictEqual(traceCallCount, i + 1, 'trace called');
  });

  it('should not call function', async () => {
    const url =
      new URL('https://hg.mozilla.org/releases/mozilla-beta/raw-file/tip/');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({
      path: `${url.pathname}browser/components/extensions/schemas/jar.mn`,
      method: 'GET'
    }).reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n');
    mockPool.intercept({
      path: `${url.pathname}browser/components/extensions/schemas/foo.json`,
      method: 'GET'
    }).reply(200, '{ "browser": "foo.json" }');
    mockPool.intercept({
      path: `${url.pathname}browser/components/extensions/schemas/bar.json`,
      method: 'GET'
    }).reply(200, '{ "browser": "bar.json" }');
    mockPool.intercept({
      path: `${url.pathname}toolkit/components/extensions/schemas/jar.mn`,
      method: 'GET'
    }).reply(200, 'content/extensions/schemas/baz.json\ncontent/extensions/schemas/qux.json\n');
    mockPool.intercept({
      path: `${url.pathname}toolkit/components/extensions/schemas/baz.json`,
      method: 'GET'
    }).reply(200, '{ "toolkit": "baz.json" }');
    mockPool.intercept({
      path: `${url.pathname}toolkit/components/extensions/schemas/qux.json`,
      method: 'GET'
    }).reply(200, '{ "toolkit": "qux.json" }');
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const stubInfo = sinon.stub(console, 'info');
    await updateSchemas({
      channel: 'beta'
    });
    const { callCount: traceCallCount } = stubTrace;
    stubWrite.restore();
    stubTrace.restore();
    stubInfo.restore();
    assert.strictEqual(traceCallCount, i, 'trace not called');
  });

  it('should not call function', async () => {
    const url =
      new URL('https://hg.mozilla.org/releases/mozilla-beta/raw-file/tip/');
    const mockPool = mockAgent.get(url.origin);
    mockPool.intercept({
      path: `${url.pathname}browser/components/extensions/schemas/jar.mn`,
      method: 'GET'
    }).reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n');
    mockPool.intercept({
      path: `${url.pathname}browser/components/extensions/schemas/foo.json`,
      method: 'GET'
    }).reply(200, '{ "browser": "foo.json" }');
    mockPool.intercept({
      path: `${url.pathname}browser/components/extensions/schemas/bar.json`,
      method: 'GET'
    }).reply(200, '{ "browser": "bar.json" }');
    mockPool.intercept({
      path: `${url.pathname}toolkit/components/extensions/schemas/jar.mn`,
      method: 'GET'
    }).reply(200, 'content/extensions/schemas/baz.json\ncontent/extensions/schemas/qux.json\n');
    mockPool.intercept({
      path: `${url.pathname}toolkit/components/extensions/schemas/baz.json`,
      method: 'GET'
    }).reply(200, '{ "toolkit": "baz.json" }');
    mockPool.intercept({
      path: `${url.pathname}toolkit/components/extensions/schemas/qux.json`,
      method: 'GET'
    }).reply(400, '{ "ok": false, "status": 400 }');
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const stubTrace = sinon.stub(console, 'trace');
    const i = stubTrace.callCount;
    const stubInfo = sinon.stub(console, 'info');
    await updateSchemas({
      channel: 'beta'
    });
    const { callCount: traceCallCount } = stubTrace;
    stubWrite.restore();
    stubTrace.restore();
    stubInfo.restore();
    assert.strictEqual(traceCallCount, i + 1, 'trace called');
  });
});
