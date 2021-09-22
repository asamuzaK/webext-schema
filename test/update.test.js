/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';
import fs from 'fs';
import nock from 'nock';
import path from 'path';
import process from 'process';
import sinon from 'sinon';

/* test */
import {
  ESR_VER,
  commander, createUnifiedSchema, fetchText, getAllSchemaData, getChannelUrl,
  getFileList, getListedSchemaData, getMailExtSchemaData, getSchemaData,
  parseCommand, saveSchemaFile, updateSchemas
} from '../modules/update.js';

describe('fetch text', () => {
  it('should throw', async () => {
    await fetchText().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should throw', async () => {
    nock('https://example.com').get('/').reply(undefined);
    await fetchText('https://example.com').catch(e => {
      assert.instanceOf(e, Error, 'error');
      assert.strictEqual(e.message,
        'Network response was not ok. status: undefined');
    });
    nock.cleanAll();
  });

  it('should throw', async () => {
    nock('https://example.com').get('/').reply(404);
    await fetchText('https://example.com').catch(e => {
      assert.instanceOf(e, Error, 'error');
      assert.strictEqual(e.message,
        'Network response was not ok. status: 404');
    });
    nock.cleanAll();
  });

  it('should get result', async () => {
    nock('https://example.com').get('/').reply(200, 'foo');
    const res = await fetchText('https://example.com');
    assert.strictEqual(res, 'foo', 'result');
    nock.cleanAll();
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
    nock('https://example.com').get('/foo.json').reply(200, {
      foo: ['bar']
    });
    const res = await getSchemaData('foo.json', 'https://example.com');
    assert.deepEqual(res, {
      file: 'foo.json',
      schema: {
        foo: ['bar']
      }
    }, 'result');
    nock.cleanAll();
  });
});

describe('get schema file list from jar manifest', () => {
  it('should throw', async () => {
    await getFileList().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should get array', async () => {
    nock('https://example.com').get('/jar.mn').reply(200, '# comment\n\ntoolkit.jar:\n% content extensions %content/extensions/\n    content/extensions/schemas/alarms.json\n    content/extensions/schemas/browser_settings.json\n#ifndef ANDROID\n    content/extensions/schemas/geckoProfiler.json\n#endif\n    content/extensions/schemas/i18n.json\n');
    const res = await getFileList('https://example.com');
    assert.deepEqual(res, [
      'alarms.json',
      'browser_settings.json',
      'geckoProfiler.json',
      'i18n.json'
    ], 'result');
    nock.cleanAll();
  });
});

describe('get all schema data', () => {
  it('should throw', async () => {
    await getAllSchemaData().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should get array', async () => {
    nock('https://example.com').get('/jar.mn')
      .reply(200, 'content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n')
      .get('/foo.json').reply(200, {
        foo: 'foobar'
      })
      .get('/bar.json').reply(200, {
        baz: 'qux'
      });
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
    nock.cleanAll();
  });
});

describe('get listed schema data', () => {
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
    nock('https://example.com').get('/foo.json').reply(200, {
      foo: 'foobar'
    }).get('/bar.json').reply(200, {
      baz: 'qux'
    });
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
    nock.cleanAll();
  });
});

describe('get MailExtensions schema data', () => {
  it('should throw', async () => {
    await getMailExtSchemaData().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should get array', async () => {
    nock('https://example.com').get('/jar.mn')
      .reply(200, '# comment\n\nmessenger.jar:\n% content/messenger/ext-mail.json\n    content/messenger/schemas/accounts.json\n    content/messenger/schemas/browserAction.json\n    content/messenger/schemas/commands.json\n    content/messenger/schemas/pkcs11.json\n')
      .get('/schemas/accounts.json').reply(200, {
        foo: 'foobar'
      })
      .get('/schemas/browserAction.json').reply(200, {
        bar: 'baz'
      });
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
    nock.cleanAll();
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
  it('should get result', async () => {
    const stubAll = sinon.stub(Promise, 'all').callsFake(async arr => {
      let val;
      switch (arr.length) {
        case 3:
          val = [
            [
              {
                file: 'foo',
                schema: {
                  foo: 'baz'
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
            ],
            [
              {
                file: 'foobar',
                schema: {
                  foobar: 'quux'
                }
              }
            ]
          ];
          break;
        case 2:
          val = [
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
          ];
          break;
        default: {
          val = [];
          for (const i of arr) {
            const j = await i;
            val.push(j);
          }
        }
      }
      return val;
    });
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const writeCount = stubWrite.callCount;
    const betaPath =
      path.join(process.cwd(), 'schemas', 'beta', 'webext.json');
    const centralPath =
      path.join(process.cwd(), 'schemas', 'central', 'webext.json');
    const esrPath =
      path.join(process.cwd(), 'schemas', 'esr', 'webext.json');
    const releasePath =
      path.join(process.cwd(), 'schemas', 'release', 'webext.json');
    const mailPath =
      path.join(process.cwd(), 'schemas', 'mail', 'mailext.json');
    const res = await updateSchemas();
    const { callCount: writeCallCount } = stubWrite;
    stubWrite.restore();
    stubAll.restore();
    assert.strictEqual(writeCallCount, writeCount + 5, 'write');
    assert.deepEqual(res, [
      betaPath,
      centralPath,
      esrPath,
      releasePath,
      mailPath
    ], 'result');
  });

  it('should get result', async () => {
    const stubAll = sinon.stub(Promise, 'all').callsFake(async arr => {
      let val;
      switch (arr.length) {
        case 3:
          val = [
            [
              {
                file: 'foo',
                schema: {
                  foo: 'baz'
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
            ],
            [
              {
                file: 'foobar',
                schema: {
                  foobar: 'quux'
                }
              }
            ]
          ];
          break;
        case 2:
          val = [
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
          ];
          break;
        default: {
          val = [];
          for (const i of arr) {
            const j = await i;
            val.push(j);
          }
        }
      }
      return val;
    });
    const stubWrite = sinon.stub(fs.promises, 'writeFile');
    const writeCount = stubWrite.callCount;
    const releasePath =
      path.join(process.cwd(), 'schemas', 'release', 'webext.json');
    const res = await updateSchemas({ channel: 'release' });
    const { callCount: writeCallCount } = stubWrite;
    stubWrite.restore();
    stubAll.restore();
    assert.strictEqual(writeCallCount, writeCount + 1, 'write');
    assert.deepEqual(res, [releasePath], 'result');
  });

  describe('parse command', () => {
    const func = parseCommand;

    it('should not parse', () => {
      const stubParse = sinon.stub(commander, 'parse');
      const i = stubParse.callCount;
      func();
      assert.strictEqual(stubParse.callCount, i, 'not called');
      stubParse.restore();
    });

    it('should not parse', () => {
      const stubParse = sinon.stub(commander, 'parse');
      const i = stubParse.callCount;
      func([]);
      assert.strictEqual(stubParse.callCount, i, 'not called');
      stubParse.restore();
    });

    it('should not parse', () => {
      const stubParse = sinon.stub(commander, 'parse');
      const i = stubParse.callCount;
      func(['foo', 'bar', 'baz']);
      assert.strictEqual(stubParse.callCount, i, 'not called');
      stubParse.restore();
    });

    it('should parse', () => {
      const stubParse = sinon.stub(commander, 'parse');
      const stubVer = sinon.stub(commander, 'version');
      const i = stubParse.callCount;
      const j = stubVer.callCount;
      func(['foo', 'bar', '-v']);
      assert.strictEqual(stubParse.callCount, i + 1, 'called');
      assert.strictEqual(stubVer.callCount, j + 1, 'called');
      stubParse.restore();
      stubVer.restore();
    });
  });
});
