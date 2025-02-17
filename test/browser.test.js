/**
 * browser.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import { browser } from './mocha/setup.js';

/* test */
// eslint-disable-next-line import-x/order
import * as mjs from '../modules/browser.js';

describe('browser', () => {
  beforeEach(() => {
    browser._sandbox.reset();
    browser.i18n.getMessage.callsFake((...args) => args.toString());
    browser.permissions.contains.resolves(true);
    global.browser = browser;
  });
  afterEach(() => {
    delete global.browser;
    browser._sandbox.reset();
  });

  it('should get browser object', () => {
    assert.strictEqual(typeof browser, 'object', 'browser');
  });

  describe('check if permission is granted', () => {
    const func = mjs.isPermissionGranted;
    beforeEach(() => {
      browser.permissions.contains.callsFake((obj = {}) => {
        const { origins, permissions } = obj;
        let res;
        if (Array.isArray(origins)) {
          const [...origs] = origins;
          // match pattern: '*://*.example.com/*'
          const grantedOrigsReg =
            /^(?:http|ws)s?:\/\/(?:[a-zA-Z\d]+\.)*example\.com\/.*$/;
          for (const orig of origs) {
            res = grantedOrigsReg.test(orig);
            if (res === false) {
              break;
            }
          }
        }
        if ((res || typeof res !== 'boolean') && Array.isArray(permissions)) {
          const [...perms] = permissions;
          const grantedPerms = ['tabs', 'browserSettings'];
          for (const perm of perms) {
            res = grantedPerms.includes(perm);
            if (res === false) {
              break;
            }
          }
        }
        return !!res;
      });
    });

    it('should get result', async () => {
      const res = await func();
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      const res = await func('foo');
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      const res = await func([]);
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      const res = await func({
        foo: ['bar']
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      const res = await func({
        origins: ['https://mozilla.org/']
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      const res = await func({
        origins: ['https://example.com/']
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should get result', async () => {
      const res = await func({
        origins: ['http://www.example.com/foo']
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should get result', async () => {
      const res = await func({
        permissions: ['alarms']
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      const res = await func({
        permissions: ['tabs']
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should get result', async () => {
      const res = await func({
        permissions: ['tabs', 'bookmarks']
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      const res = await func({
        permissions: ['tabs', 'browserSettings']
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should get result', async () => {
      const res = await func({
        permissions: ['tabs', 'browserSettings', 'commands']
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      const res = await func({
        origins: ['https://example.com/'],
        permissions: ['tabs']
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should get result', async () => {
      const res = await func({
        origins: ['https://mozilla.org/'],
        permissions: ['tabs']
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      const res = await func({
        origins: ['https://example.com/'],
        permissions: ['alarms']
      });
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('create bookmark', () => {
    const func = mjs.createBookmark;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.bookmarks.create.callCount;
      const res = await func({ foo: 'bar' });
      assert.strictEqual(browser.bookmarks.create.callCount, i, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get null if no argument given', async () => {
      const res = await func();
      assert.deepEqual(res, null, 'result');
    });

    it('should get null if argument is not object', async () => {
      const res = await func('foo');
      assert.deepEqual(res, null, 'result');
    });

    it('should get null if argument is empty object', async () => {
      const res = await func({});
      assert.deepEqual(res, null, 'result');
    });

    it('should get object', async () => {
      browser.bookmarks.create.withArgs({ foo: 'bar' }).resolves({});
      const res = await func({ foo: 'bar' });
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('get bookmark tree node', () => {
    const func = mjs.getBookmarkTreeNode;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.bookmarks.create.callCount;
      const res = await func({ foo: 'bar' });
      assert.strictEqual(browser.bookmarks.create.callCount, i, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should call function', async () => {
      const i = browser.bookmarks.get.callCount;
      const j = browser.bookmarks.getSubTree.callCount;
      const k = browser.bookmarks.getTree.callCount;
      browser.bookmarks.getTree.resolves([{}]);
      const res = await func();
      assert.strictEqual(browser.bookmarks.get.callCount, i, 'not called get');
      assert.strictEqual(browser.bookmarks.getSubTree.callCount, j,
        'not called get sub tree');
      assert.strictEqual(browser.bookmarks.getTree.callCount, k + 1,
        'called get tree');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should throw if ID not found', async () => {
      browser.bookmarks.getSubTree.withArgs('foo').rejects(new Error('error'));
      await func('foo').catch(e => {
        assert.deepStrictEqual(e, new Error('error'));
      });
    });

    it('should call function', async () => {
      const i = browser.bookmarks.get.callCount;
      const j = browser.bookmarks.getSubTree.callCount;
      const k = browser.bookmarks.getTree.callCount;
      browser.bookmarks.getSubTree.withArgs('foo').resolves([{}]);
      const res = await func('foo');
      assert.strictEqual(browser.bookmarks.get.callCount, i, 'not called get');
      assert.strictEqual(browser.bookmarks.getSubTree.callCount, j + 1,
        'called get sub tree');
      assert.strictEqual(browser.bookmarks.getTree.callCount, k,
        'not called get tree');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.bookmarks.get.callCount;
      const j = browser.bookmarks.getSubTree.callCount;
      const k = browser.bookmarks.getTree.callCount;
      browser.bookmarks.get.withArgs(['foo', 'bar']).resolves([{}, {}]);
      const res = await func(['foo', 'bar']);
      assert.strictEqual(browser.bookmarks.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.bookmarks.getSubTree.callCount, j,
        'not called get sub tree');
      assert.strictEqual(browser.bookmarks.getTree.callCount, k,
        'not called get tree');
      assert.deepEqual(res, [{}, {}], 'result');
    });
  });

  describe('get closeTabsByDoubleClick user value', () => {
    const func = mjs.getCloseTabsByDoubleClickValue;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.browserSettings.closeTabsByDoubleClick.get.callCount;
      const res = await func({ foo: 'bar' });
      assert.strictEqual(
        browser.browserSettings.closeTabsByDoubleClick.get.callCount, i,
        'not called'
      );
      assert.deepEqual(res, null, 'result');
    });

    it('should get null', async () => {
      const res = await func();
      assert.deepEqual(res, null, 'result');
    });

    it('should get object', async () => {
      browser.browserSettings.closeTabsByDoubleClick.get.withArgs({})
        .resolves({});
      const res = await func();
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('set context menu on mouseup', () => {
    const func = mjs.setContextMenuOnMouseup;

    it('should get false if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.browserSettings.contextMenuShowEvent.get.callCount;
      const res = await func();
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.get.callCount, i,
        'not called'
      );
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', async () => {
      const i = browser.browserSettings.contextMenuShowEvent.get.callCount;
      const j = browser.browserSettings.contextMenuShowEvent.set.callCount;
      browser.browserSettings.contextMenuShowEvent.get.resolves({
        value: 'mouseup'
      });
      const res = await func();
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.get.callCount, i + 1,
        'called'
      );
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.set.callCount, j,
        'not called'
      );
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', async () => {
      const i = browser.browserSettings.contextMenuShowEvent.get.callCount;
      const j = browser.browserSettings.contextMenuShowEvent.set.callCount;
      browser.browserSettings.contextMenuShowEvent.get.resolves({
        value: 'mousedown',
        levelOfControl: 'controllable_by_this_extension'
      });
      browser.browserSettings.contextMenuShowEvent.set.resolves(true);
      const res = await func();
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.get.callCount, i + 1,
        'called'
      );
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.set.callCount, j + 1,
        'called'
      );
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', async () => {
      const i = browser.browserSettings.contextMenuShowEvent.get.callCount;
      const j = browser.browserSettings.contextMenuShowEvent.set.callCount;
      browser.browserSettings.contextMenuShowEvent.get.resolves({
        value: 'mousedown',
        levelOfControl: 'controllable_by_this_extension'
      });
      browser.browserSettings.contextMenuShowEvent.set.resolves(false);
      const res = await func();
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.get.callCount, i + 1,
        'called'
      );
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.set.callCount, j + 1,
        'called'
      );
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', async () => {
      const i = browser.browserSettings.contextMenuShowEvent.get.callCount;
      const j = browser.browserSettings.contextMenuShowEvent.set.callCount;
      browser.browserSettings.contextMenuShowEvent.get.resolves({
        value: 'mousedown',
        levelOfControl: 'foo'
      });
      const res = await func();
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.get.callCount, i + 1,
        'called'
      );
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.set.callCount, j,
        'not called'
      );
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('clear context menu on mouseup', () => {
    const func = mjs.clearContextMenuOnMouseup;

    it('should get false if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.browserSettings.contextMenuShowEvent.clear.callCount;
      const res = await func();
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.clear.callCount, i,
        'not called'
      );
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', async () => {
      const i = browser.browserSettings.contextMenuShowEvent.clear.callCount;
      browser.browserSettings.contextMenuShowEvent.clear.resolves(true);
      const res = await func();
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.clear.callCount, i + 1,
        'called'
      );
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', async () => {
      const i = browser.browserSettings.contextMenuShowEvent.clear.callCount;
      browser.browserSettings.contextMenuShowEvent.clear.resolves(false);
      const res = await func();
      assert.strictEqual(
        browser.browserSettings.contextMenuShowEvent.clear.callCount, i + 1,
        'called'
      );
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('get new tab position value', () => {
    const func = mjs.getNewTabPositionValue;

    it('should get null if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.browserSettings.newTabPosition.get.callCount;
      const res = await func();
      assert.strictEqual(
        browser.browserSettings.newTabPosition.get.callCount, i, 'not called'
      );
      assert.deepEqual(res, null, 'result');
    });

    it('should get value', async () => {
      const i = browser.browserSettings.newTabPosition.get.callCount;
      browser.browserSettings.newTabPosition.get.resolves('foo');
      const res = await func();
      assert.strictEqual(
        browser.browserSettings.newTabPosition.get.callCount, i + 1, 'called'
      );
      assert.strictEqual(res, 'foo', 'result');
    });
  });

  describe('is command customizable', () => {
    const func = mjs.isCommandCustomizable;

    it('should get false if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const res = await func();
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', async () => {
      const res = await func();
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('update command', () => {
    const func = mjs.updateCommand;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.');
      });
    });

    it('should throw if first argument is not string', async () => {
      await func(1).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Number.');
      });
    });

    it('should throw if 2nd argument is not string', async () => {
      await func('foo', 1).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Number.');
      });
    });

    it('should get null', async () => {
      browser.permissions.contains.resolves(false);
      const res = await func('foo', '');
      assert.strictEqual(browser.commands.reset.calledOnce, false,
        'not called');
      assert.strictEqual(browser.commands.update.calledOnce, false,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get null', async () => {
      const res = await func('foo', 'a');
      assert.strictEqual(browser.commands.reset.calledOnce, false,
        'not called');
      assert.strictEqual(browser.commands.update.calledOnce, false,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should call function', async () => {
      browser.commands.reset.resolves(undefined);
      browser.commands.update.rejects();
      const res = await func('foo', '');
      assert.strictEqual(browser.commands.reset.calledOnce, true, 'called');
      assert.strictEqual(browser.commands.update.calledOnce, false,
        'not called');
      assert.strictEqual(res, undefined, 'result');
    });

    it('should call function', async () => {
      browser.commands.reset.rejects();
      browser.commands.update.resolves(undefined);
      const items = [
        'Alt+1', 'Command+1', 'Ctrl+1', 'MacCtrl+1',
        'Alt+Shift+1', 'Command+Shift+1', 'Ctrl+Shift+1', 'MacCtrl+Shift+1',
        'Alt+Command+1', 'Alt+Ctrl+1', 'Alt+MacCtrl+1',
        'Command+Alt+1', 'Command+MacCtrl+1',
        'Ctrl+Alt+1', 'Ctrl+MacCtrl+1',
        'MacCtrl+Alt+1', 'MacCtrl+Command+1', 'MacCtrl+Ctrl+1',
        'Alt+a', 'Command+a', 'Ctrl+a', 'MacCtrl+a',
        'Alt+Shift+a', 'Command+Shift+a', 'Ctrl+Shift+a', 'MacCtrl+Shift+a',
        'Alt+Command+a', 'Alt+Ctrl+a', 'Alt+MacCtrl+a',
        'Command+Alt+a', 'Command+MacCtrl+a',
        'Ctrl+Alt+a', 'Ctrl+MacCtrl+a',
        'MacCtrl+Alt+a', 'MacCtrl+Command+a', 'MacCtrl+Ctrl+a',
        'Alt+F1', 'Command+F1', 'Ctrl+F1', 'MacCtrl+F1',
        'Alt+Shift+F1', 'Command+Shift+F1', 'Ctrl+Shift+F1', 'MacCtrl+Shift+F1',
        'Alt+Command+F1', 'Alt+Ctrl+F1', 'Alt+MacCtrl+F1',
        'Command+Alt+F1', 'Command+MacCtrl+F1',
        'Ctrl+Alt+F1', 'Ctrl+MacCtrl+F1',
        'MacCtrl+Alt+F1', 'MacCtrl+Command+F1', 'MacCtrl+Ctrl+F1',
        'Alt+PageDown', 'Command+PageDown', 'Ctrl+PageDown', 'MacCtrl+PageDown',
        'Alt+Shift+PageDown', 'Command+Shift+PageDown', 'Ctrl+Shift+PageDown',
        'MacCtrl+Shift+PageDown',
        'Alt+Command+PageDown', 'Alt+Ctrl+PageDown', 'Alt+MacCtrl+PageDown',
        'Command+Alt+PageDown', 'Command+MacCtrl+PageDown',
        'Ctrl+Alt+PageDown', 'Ctrl+MacCtrl+PageDown',
        'MacCtrl+Alt+PageDown', 'MacCtrl+Command+PageDown',
        'MacCtrl+Ctrl+PageDown',
        'Alt+Up', 'Command+Up', 'Ctrl+Up', 'MacCtrl+Up',
        'Alt+Shift+Up', 'Command+Shift+Up', 'Ctrl+Shift+Up', 'MacCtrl+Shift+Up',
        'Alt+Command+Up', 'Alt+Ctrl+Up', 'Alt+MacCtrl+Up',
        'Command+Alt+Up', 'Command+MacCtrl+Up',
        'Ctrl+Alt+Up', 'Ctrl+MacCtrl+Up',
        'MacCtrl+Alt+Up', 'MacCtrl+Command+Up', 'MacCtrl+Ctrl+Up',
        'Alt+Left', 'Command+Left', 'Ctrl+Left', 'MacCtrl+Left',
        'Alt+Shift+Left', 'Command+Shift+Left', 'Ctrl+Shift+Left',
        'MacCtrl+Shift+Left',
        'Alt+Command+Left', 'Alt+Ctrl+Left', 'Alt+MacCtrl+Left',
        'Command+Alt+Left', 'Command+MacCtrl+Left',
        'Ctrl+Alt+Left', 'Ctrl+MacCtrl+Left',
        'MacCtrl+Alt+Left', 'MacCtrl+Command+Left', 'MacCtrl+Ctrl+Left',
        'F1', 'F12',
        'MediaNextTrack', 'MediaPrevTrack', 'MediaPlayPause', 'MediaStop'
      ];
      for (const item of items) {
        const i = browser.commands.update.callCount;
        // eslint-disable-next-line no-await-in-loop
        const res = await func('foo', item);
        assert.strictEqual(browser.commands.update.callCount, i + 1,
                           `called ${item}`);
        assert.strictEqual(browser.commands.reset.calledOnce, false,
          'not called');
        assert.strictEqual(res, undefined, 'result');
      }
    });

    it('should call function', async () => {
      browser.commands.reset.rejects();
      browser.commands.update.resolves(undefined);
      const res = await func('foo', ' Ctrl+a ');
      assert.strictEqual(browser.commands.update.calledOnce, true, 'called');
      assert.strictEqual(browser.commands.reset.calledOnce, false,
        'not called');
      assert.strictEqual(res, undefined, 'result');
    });
  });

  describe('get all contextual identities', () => {
    const func = mjs.getAllContextualIdentities;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.contextualIdentities.query.callCount;
      const res = await func();
      assert.strictEqual(browser.contextualIdentities.query.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should throw', async () => {
      browser.contextualIdentities.query.rejects(new Error('error'));
      await func().catch(e => {
        assert.deepStrictEqual(e, new Error('error'));
      });
    });

    it('should get result', async () => {
      browser.contextualIdentities.query.withArgs({}).resolves([
        {
          foo: 'bar'
        },
        {
          baz: 'qux'
        }
      ]);
      const res = await func();
      assert.strictEqual(Array.isArray(res), true, 'array');
      assert.deepEqual(res, [{ foo: 'bar' }, { baz: 'qux' }], 'result');
    });
  });

  describe('get contextual identities', () => {
    const func = mjs.getContextualId;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Undefined.'));
      });
    });

    it('should throw if given argument is not string', async () => {
      await func(1).catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Number.'));
      });
    });

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.contextualIdentities.get.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.contextualIdentities.get.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should throw', async () => {
      browser.contextualIdentities.get.withArgs('foo')
        .rejects(new Error('error'));
      await func('foo').catch(e => {
        assert.deepStrictEqual(e, new Error('error'));
      });
    });

    it('should get result', async () => {
      browser.contextualIdentities.get.withArgs('foo').resolves({});
      const res = await func('foo');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('get enabled theme', () => {
    const func = mjs.getEnabledTheme;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.management.getAll.callCount, i, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get null', async () => {
      const res = await func();
      assert.deepEqual(res, null, 'result');
    });

    it('should throw', async () => {
      browser.management.getAll.rejects(new Error('error'));
      await func().catch(e => {
        assert.deepStrictEqual(e, new Error('error'));
      });
    });

    it('should get null', async () => {
      browser.management.getAll.resolves([]);
      const res = await func();
      assert.deepEqual(res, null, 'result');
    });

    it('should get array', async () => {
      browser.management.getAll.resolves([
        {
          enabled: false,
          type: 'theme'
        },
        {
          enabled: true,
          type: 'foo'
        },
        {
          enabled: true,
          type: 'theme'
        },
        {
          enabled: false,
          type: 'bar'
        }
      ]);
      const stub = sinon.stub(console, 'error');
      const res = await func();
      const { called } = stub;
      stub.restore();
      assert.strictEqual(called, false, 'not logged');
      assert.deepEqual(res, [
        {
          enabled: true,
          type: 'theme'
        }
      ], 'result');
    });
  });

  describe('get extension info', () => {
    const func = mjs.getExtensionInfo;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Undefined.'));
      });
    });

    it('should throw if given argument is not string', async () => {
      await func(1).catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Number.'));
      });
    });

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.management.get.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.management.get.callCount, i, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should reject if given id is not found', async () => {
      browser.management.get.withArgs('foo').rejects(new Error('error'));
      await func('foo').catch(e => {
        assert.deepStrictEqual(e, new Error('error'));
      });
    });

    it('should get object', async () => {
      browser.management.get.withArgs('foo').resolves({});
      const res = await func('foo');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('get external extensions', () => {
    const func = mjs.getExternalExtensions;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.management.getAll.callCount, i, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get null', async () => {
      const res = await func();
      assert.deepEqual(res, null, 'result');
    });

    it('should throw', async () => {
      browser.management.getAll.rejects(new Error('error'));
      await func().catch(e => {
        assert.deepStrictEqual(e, new Error('error'));
      });
    });

    it('should get null', async () => {
      browser.management.getAll.resolves([]);
      const res = await func();
      assert.deepEqual(res, null, 'result');
    });

    it('should get array', async () => {
      browser.management.getAll.resolves([
        {
          type: 'extension'
        },
        {
          type: 'foo'
        },
        {
          type: 'extension'
        },
        {
          type: 'bar'
        }
      ]);
      const res = await func();
      assert.deepEqual(res, [
        {
          type: 'extension'
        },
        {
          type: 'extension'
        }
      ], 'result');
    });
  });

  describe('clear notification', () => {
    const func = mjs.clearNotification;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Undefined.'));
      });
    });

    it('should throw if given argument is not string', async () => {
      await func(1).catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Number.'));
      });
    });

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.notifications.clear.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.notifications.clear.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get result', async () => {
      browser.notifications.clear.withArgs('foo').resolves(true);
      const res = await func('foo');
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('create notification', () => {
    const func = mjs.createNotification;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Undefined.'));
      });
    });

    it('should throw if first argument is not string', async () => {
      await func(1).catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Number.'));
      });
    });

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.notifications.create.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.notifications.create.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get message', async () => {
      browser.notifications.create.withArgs('foo', {}).resolves('bar');
      const res = await func('foo', {});
      assert.strictEqual(res, 'bar', 'result');
    });

    it('should get message', async () => {
      browser.notifications.onClosed.hasListener.returns(false);
      browser.notifications.create.withArgs('foo', {}).resolves('bar');
      const i = browser.notifications.onClosed.addListener.callCount;
      const res = await func('foo', {});
      assert.strictEqual(browser.notifications.onClosed.addListener.callCount,
        i + 1, 'called');
      assert.strictEqual(res, 'bar', 'result');
    });

    it('should get message', async () => {
      browser.notifications.onClosed.hasListener.returns(true);
      browser.notifications.create.withArgs('foo', {}).resolves('bar');
      const i = browser.notifications.onClosed.addListener.callCount;
      const res = await func('foo', {});
      assert.strictEqual(browser.notifications.onClosed.addListener.callCount,
        i, 'not called');
      assert.strictEqual(res, 'bar', 'result');
    });
  });

  describe('remove permission', () => {
    const func = mjs.removePermission;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String or Array but got Undefined.'));
      });
    });

    it('should throw if given argument is not string or array', async () => {
      await func(1).catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String or Array but got Number.'));
      });
    });

    it('should get result', async () => {
      browser.permissions.remove.withArgs({ permissions: ['foo'] })
        .resolves(true);
      const res = await func('foo');
      assert.strictEqual(res, true, 'result');
    });

    it('should get result', async () => {
      browser.permissions.remove.withArgs({ permissions: ['foo'] })
        .resolves(false);
      const res = await func('foo');
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      browser.permissions.remove.withArgs({ permissions: ['foo'] })
        .resolves(true);
      const res = await func(['foo']);
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('request permission', () => {
    const func = mjs.requestPermission;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String or Array but got Undefined.'));
      });
    });

    it('should throw if given argument is not string or array', async () => {
      await func(1).catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String or Array but got Number.'));
      });
    });

    it('should get result', async () => {
      browser.permissions.request.withArgs({ permissions: ['foo'] })
        .resolves(true);
      const res = await func('foo');
      assert.strictEqual(res, true, 'result');
    });

    it('should get result', async () => {
      browser.permissions.request.withArgs({ permissions: ['foo'] })
        .resolves(false);
      const res = await func('foo');
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      browser.permissions.request.withArgs({ permissions: ['foo'] })
        .resolves(true);
      const res = await func(['foo']);
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('get manifest icons', () => {
    const func = mjs.getManifestIcons;

    it('should get object', () => {
      browser.runtime.getManifest.returns({ icons: { foo: 'bar' } });
      const res = func();
      assert.deepEqual(res, { foo: 'bar' }, 'result');
    });
  });

  describe('get manifest version', () => {
    const func = mjs.getManifestVersion;

    it('should get result', () => {
      browser.runtime.getManifest.returns({ manifest_version: 2 });
      const res = func();
      assert.strictEqual(res, 2, 'result');
    });

    it('should get result', () => {
      browser.runtime.getManifest.returns({ manifest_version: 3 });
      const res = func();
      assert.strictEqual(res, 3, 'result');
    });
  });

  describe('get OS', () => {
    const func = mjs.getOs;

    it('should get string', async () => {
      browser.runtime.getPlatformInfo.resolves({ os: 'foo' });
      const res = await func();
      assert.strictEqual(res, 'foo', 'result');
    });
  });

  describe('make a connection', () => {
    const func = mjs.makeConnection;

    it('should get object', async () => {
      browser.tabs.connect.withArgs(1).resolves({ bar: 'baz' });
      const res = await func(1);
      assert.deepEqual(res, { bar: 'baz' }, 'result');
    });

    it('should get object', async () => {
      browser.tabs.connect.withArgs(1, { foo: 'bar' }).resolves({ bar: 'baz' });
      const res = await func(1, { foo: 'bar' });
      assert.deepEqual(res, { bar: 'baz' }, 'result');
    });

    it('should get object', async () => {
      browser.tabs.connect.withArgs(1, { foo: 'bar' }).resolves({ bar: 'baz' });
      const res = await func(1, { foo: 'bar' });
      assert.deepEqual(res, { bar: 'baz' }, 'result');
    });

    it('should get object', async () => {
      browser.runtime.connect.withArgs('foo').resolves({ bar: 'baz' });
      const res = await func('foo');
      assert.deepEqual(res, { bar: 'baz' }, 'result');
    });

    it('should get object', async () => {
      browser.runtime.connect.withArgs('foo', { foo: 'bar' })
        .resolves({ bar: 'baz' });
      const res = await func('foo', { foo: 'bar' });
      assert.deepEqual(res, { bar: 'baz' }, 'result');
    });

    it('should get object', async () => {
      browser.runtime.connectNative.withArgs('foo').resolves({ bar: 'baz' });
      const res = await func('foo', true);
      assert.deepEqual(res, { bar: 'baz' }, 'result');
    });

    it('should get object', async () => {
      browser.runtime.connect.withArgs({ foo: 'bar' }).resolves({ bar: 'baz' });
      const res = await func({ foo: 'bar' });
      assert.deepEqual(res, { bar: 'baz' }, 'result');
    });

    it('should get object', async () => {
      browser.runtime.connect.withArgs({ foo: 'bar' }).resolves({ bar: 'baz' });
      const res = await func(null, { foo: 'bar' });
      assert.deepEqual(res, { bar: 'baz' }, 'result');
    });

    it('should get object', async () => {
      browser.runtime.connect.withArgs().resolves({ bar: 'baz' });
      const res = await func();
      assert.deepEqual(res, { bar: 'baz' }, 'result');
    });
  });

  describe('send message', () => {
    const func = mjs.sendMessage;

    it('should not call function', async () => {
      const i = browser.tabs.sendMessage.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func();
      assert.strictEqual(browser.tabs.sendMessage.callCount, i, 'not called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should call function', async () => {
      browser.runtime.sendMessage.withArgs('foo', null).resolves({});
      const i = browser.runtime.sendMessage.callCount;
      const res = await func(null, 'foo');
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.runtime.sendMessage.withArgs('foo', { bar: 'baz' })
        .resolves({});
      const i = browser.runtime.sendMessage.callCount;
      const res = await func(null, 'foo', { bar: 'baz' });
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.runtime.sendMessage.withArgs('foo', 'bar', null).resolves({});
      const i = browser.runtime.sendMessage.callCount;
      const res = await func('foo', 'bar');
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.tabs.sendMessage.withArgs(1, 'foo', null).resolves({});
      const i = browser.tabs.sendMessage.callCount;
      const res = await func(1, 'foo');
      assert.strictEqual(browser.tabs.sendMessage.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.sendMessage.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func(browser.tabs.TAB_ID_NONE, 'foo');
      assert.strictEqual(browser.tabs.sendMessage.callCount, i, 'not called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j,
        'not called');
      assert.deepEqual(res, null, 'result');
    });
  });

  describe('is scripting available', () => {
    const func = mjs.isScriptingAvailable;

    it('should get false if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const res = await func();
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', async () => {
      const res = await func();
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('execute script to tab', () => {
    const func = mjs.executeScriptToTab;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      browser.scripting.executeScript.resolves([{}]);
      const i = browser.scripting.executeScript.callCount;
      const res = await func();
      assert.strictEqual(browser.scripting.executeScript.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should not call function if no tabId in target', async () => {
      browser.scripting.executeScript.resolves([{}]);
      const i = browser.scripting.executeScript.callCount;
      const res = await func({
        target: {}
      });
      assert.strictEqual(browser.scripting.executeScript.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should not call function if files / func is not included', async () => {
      browser.scripting.executeScript.resolves([{}]);
      const i = browser.scripting.executeScript.callCount;
      const res = await func({
        target: {
          tabId: 1
        }
      });
      assert.strictEqual(browser.scripting.executeScript.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should not call function if files is an empty array', async () => {
      browser.scripting.executeScript.resolves([{}]);
      const i = browser.scripting.executeScript.callCount;
      const res = await func({
        files: [],
        target: {
          tabId: 1
        }
      });
      assert.strictEqual(browser.scripting.executeScript.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should throw', async () => {
      browser.scripting.executeScript.rejects(new Error('error'));
      const stubErr = sinon.stub(console, 'error');
      await func({
        files: ['foo/bar'],
        target: {
          tabId: 1
        }
      }).catch(e => {
        assert.deepStrictEqual(e, new Error('error'));
      });
      stubErr.restore();
    });

    it('should call function', async () => {
      browser.scripting.executeScript.resolves([{}]);
      const i = browser.scripting.executeScript.callCount;
      const res = await func({
        files: ['foo/bar'],
        target: {
          tabId: 1
        }
      });
      assert.strictEqual(browser.scripting.executeScript.callCount, i + 1,
        'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should not call function if func is not a function', async () => {
      browser.scripting.executeScript.resolves([{}]);
      const i = browser.scripting.executeScript.callCount;
      const res = await func({
        func: 'foo',
        target: {
          tabId: 1
        }
      });
      assert.strictEqual(browser.scripting.executeScript.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should call function', async () => {
      browser.scripting.executeScript.resolves([{}]);
      const i = browser.scripting.executeScript.callCount;
      const res = await func({
        func: () => {},
        target: {
          tabId: 1
        }
      });
      assert.strictEqual(browser.scripting.executeScript.callCount, i + 1,
        'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.scripting.executeScript.resolves([{}]);
      const i = browser.scripting.executeScript.callCount;
      const res = await func({
        args: ['foo'],
        func: arg => arg,
        target: {
          tabId: 1
        }
      });
      assert.strictEqual(browser.scripting.executeScript.callCount, i + 1,
        'called');
      assert.deepEqual(res, [{}], 'result');
    });
  });

  describe('search in new tab', () => {
    const func = mjs.searchInNewTab;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message,
          'Expected String but got Undefined.');
      });
    });

    it('should throw if 1st argument is not string', async () => {
      await func(1).catch(e => {
        assert.strictEqual(e.message,
          'Expected String but got Number.');
      });
    });

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.search.query.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.search.query.callCount, i, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should call function', async () => {
      browser.tabs.create.resolves({
        id: 1
      });
      browser.tabs.get.withArgs(1).resolves({
        id: 1
      });
      const i = browser.search.query.withArgs({
        text: 'foo',
        tabId: 1
      }).callCount;
      const res = await func('foo');
      assert.strictEqual(browser.search.query.withArgs({
        text: 'foo',
        tabId: 1
      }).callCount, i + 1, 'called');
      assert.deepEqual(res, {
        id: 1
      }, 'result');
    });

    it('should call function', async () => {
      browser.tabs.create.withArgs({
        index: 2
      }).resolves({
        id: 1,
        index: 2
      });
      browser.tabs.get.withArgs(1).resolves({
        id: 1,
        index: 2
      });
      const i = browser.search.query.withArgs({
        text: 'foo',
        tabId: 1
      }).callCount;
      const res = await func('foo', {
        index: 2
      });
      assert.strictEqual(browser.search.query.withArgs({
        text: 'foo',
        tabId: 1
      }).callCount, i + 1, 'called');
      assert.deepEqual(res, {
        id: 1,
        index: 2
      }, 'result');
    });
  });

  describe('search with a search engine', () => {
    const func = mjs.searchWithSearchEngine;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Undefined.'));
      });
    });

    it('should throw if 1st argument is not string', async () => {
      await func(1).catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Number.'));
      });
    });

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.search.search.callCount;
      await func('foo');
      assert.strictEqual(browser.search.search.callCount, i, 'not called');
    });

    it('should call function', async () => {
      const i = browser.search.search.withArgs({
        query: 'foo'
      }).callCount;
      await func('foo');
      assert.strictEqual(browser.search.search.withArgs({
        query: 'foo'
      }).callCount, i + 1, 'called');
    });

    it('should call function', async () => {
      const i = browser.search.search.withArgs({
        engine: 'bar',
        query: 'foo',
        tabId: 1
      }).callCount;
      await func('foo', {
        engine: 'bar',
        tabId: 1
      });
      assert.strictEqual(browser.search.search.withArgs({
        engine: 'bar',
        query: 'foo',
        tabId: 1
      }).callCount, i + 1, 'called');
    });
  });

  describe('get recently closed tab', () => {
    const func = mjs.getRecentlyClosedTab;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.sessions.getRecentlyClosed.callCount;
      const res = await func();
      assert.strictEqual(browser.sessions.getRecentlyClosed.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get null', async () => {
      browser.sessions.getRecentlyClosed.resolves([]);
      const res = await func();
      assert.deepEqual(res, null, 'result');
    });

    it('should get null', async () => {
      browser.sessions.getRecentlyClosed.resolves([]);
      const res = await func(1);
      assert.deepEqual(res, null, 'result');
    });

    it('should get null', async () => {
      browser.sessions.getRecentlyClosed.resolves([{}]);
      const res = await func();
      assert.deepEqual(res, null, 'result');
    });

    it('should get null', async () => {
      browser.sessions.getRecentlyClosed.resolves([{ tab: { windowId: 2 } }]);
      const res = await func(1);
      assert.deepEqual(res, null, 'result');
    });

    it('should get object', async () => {
      const tab = { windowId: 1 };
      browser.sessions.getRecentlyClosed.resolves([{ tab }]);
      const res = await func(1);
      assert.deepEqual(res, tab, 'result');
    });

    it('should get object', async () => {
      const tab = { windowId: 1 };
      browser.sessions.getRecentlyClosed.resolves([
        { tab: { windowId: 2 } },
        { tab }
      ]);
      const res = await func(1);
      assert.deepEqual(res, tab, 'result');
    });
  });

  describe('get session window value', () => {
    const func = mjs.getSessionWindowValue;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Undefined.'));
      });
    });

    it('should throw if given argument is not string', async () => {
      await func(1).catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Number.'));
      });
    });

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.sessions.getWindowValue.callCount;
      const res = await func('foo', 1);
      assert.strictEqual(browser.sessions.getWindowValue.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get object', async () => {
      browser.sessions.getWindowValue.withArgs(1, 'foo').resolves('bar');
      const res = await func('foo', 1);
      assert.strictEqual(res, 'bar', 'result');
    });

    it('should get object', async () => {
      browser.sessions.getWindowValue
        .withArgs(browser.windows.WINDOW_ID_CURRENT, 'foo').resolves('bar');
      const res = await func('foo');
      assert.strictEqual(res, 'bar', 'result');
    });
  });

  describe('restore session', () => {
    const func = mjs.restoreSession;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Undefined.'));
      });
    });

    it('should throw if given argument is not string', async () => {
      await func(1).catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Number.'));
      });
    });

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.sessions.getWindowValue.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.sessions.getWindowValue.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get object', async () => {
      browser.sessions.restore.withArgs('foo').resolves({});
      const res = await func('foo');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('set session window value', () => {
    const func = mjs.setSessionWindowValue;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Undefined.'));
      });
    });

    it('should throw if given argument is not string', async () => {
      await func(1).catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected String but got Number.'));
      });
    });

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.sessions.setWindowValue.callCount;
      await func('foo');
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i,
        'not called');
    });

    it('should call function', async () => {
      const i = browser.sessions.setWindowValue.callCount;
      await func('foo', 'bar', 1);
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
        'called');
    });

    it('should call function', async () => {
      const i = browser.sessions.setWindowValue.callCount;
      await func('foo', 'bar');
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
        'called');
    });
  });

  describe('clear storage', () => {
    const func = mjs.clearStorage;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.storage.local.clear.callCount;
      const j = browser.storage.managed.clear.callCount;
      // const k = browser.storage.session.clear.callCount;
      const l = browser.storage.sync.clear.callCount;
      await func();
      assert.strictEqual(browser.storage.local.clear.callCount, i,
        'not called');
      assert.strictEqual(browser.storage.managed.clear.callCount, j,
        'not called');
      /*
      assert.strictEqual(browser.storage.session.clear.callCount, k,
        'not called');
      */
      assert.strictEqual(browser.storage.sync.clear.callCount, l, 'not called');
    });

    it('should not call function', async () => {
      const i = browser.storage.local.clear.callCount;
      const j = browser.storage.managed.clear.callCount;
      // const k = browser.storage.session.clear.callCount;
      const l = browser.storage.sync.clear.callCount;
      await func('foo');
      assert.strictEqual(browser.storage.local.clear.callCount, i,
        'not called');
      assert.strictEqual(browser.storage.managed.clear.callCount, j,
        'not called');
      /*
      assert.strictEqual(browser.storage.session.clear.callCount, k,
        'not called');
      */
      assert.strictEqual(browser.storage.sync.clear.callCount, l, 'not called');
    });

    it('should call function', async () => {
      const i = browser.storage.local.clear.callCount;
      await func();
      assert.strictEqual(browser.storage.local.clear.callCount, i + 1,
        'called');
    });

    it('should call function', async () => {
      const i = browser.storage.local.clear.callCount;
      await func('local');
      assert.strictEqual(browser.storage.local.clear.callCount, i + 1,
        'called');
    });

    it('should not call function', async () => {
      const i = browser.storage.managed.clear.callCount;
      await func('managed');
      assert.strictEqual(browser.storage.managed.clear.callCount, i,
        'not called');
    });

    /*
    it('should call function', async () => {
      const i = browser.storage.session.clear.callCount;
      await func('session');
      assert.strictEqual(browser.storage.session.clear.callCount, i + 1,
        'called');
    });
    */

    it('should call function', async () => {
      const i = browser.storage.sync.clear.callCount;
      await func('sync');
      assert.strictEqual(browser.storage.sync.clear.callCount, i + 1, 'called');
    });
  });

  describe('get all storage', () => {
    const func = mjs.getAllStorage;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.storage.local.get.callCount;
      const j = browser.storage.managed.get.callCount;
      // const k = browser.storage.session.get.callCount;
      const l = browser.storage.sync.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i,
        'not called');
      assert.strictEqual(browser.storage.managed.get.callCount, j,
        'not called');
      /*
      assert.strictEqual(browser.storage.session.get.callCount, k,
        'not called');
      */
      assert.strictEqual(browser.storage.sync.get.callCount, l, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should not call function', async () => {
      const i = browser.storage.local.get.callCount;
      const j = browser.storage.managed.get.callCount;
      // const k = browser.storage.session.get.callCount;
      const l = browser.storage.sync.get.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.storage.local.get.callCount, i, 'not called');
      assert.strictEqual(browser.storage.managed.get.callCount, j,
        'not called');
      /*
      assert.strictEqual(browser.storage.session.get.callCount, k,
        'not called');
      */
      assert.strictEqual(browser.storage.sync.get.callCount, l, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({ foo: 'bar' });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, { foo: 'bar' }, 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({ foo: 'bar' });
      const i = browser.storage.local.get.callCount;
      const res = await func('local');
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, { foo: 'bar' }, 'result');
    });

    it('should call function', async () => {
      browser.storage.managed.get.resolves({ foo: 'bar' });
      const i = browser.storage.managed.get.callCount;
      const res = await func('managed');
      assert.strictEqual(browser.storage.managed.get.callCount, i + 1,
        'called');
      assert.deepEqual(res, { foo: 'bar' }, 'result');
    });

    /*
    it('should call function', async () => {
      browser.storage.session.get.resolves({ foo: 'bar' });
      const i = browser.storage.session.get.callCount;
      const res = await func('session');
      assert.strictEqual(browser.storage.session.get.callCount, i + 1,
        'called');
      assert.deepEqual(res, { foo: 'bar' }, 'result');
    });
    */

    it('should call function', async () => {
      browser.storage.sync.get.resolves({ foo: 'bar' });
      const i = browser.storage.sync.get.callCount;
      const res = await func('sync');
      assert.strictEqual(browser.storage.sync.get.callCount, i + 1, 'called');
      assert.deepEqual(res, { foo: 'bar' }, 'result');
    });
  });

  describe('get storage', () => {
    const func = mjs.getStorage;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.storage.local.get.callCount;
      const j = browser.storage.managed.get.callCount;
      // const k = browser.storage.session.get.callCount;
      const l = browser.storage.sync.get.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.storage.local.get.callCount, i, 'not called');
      assert.strictEqual(browser.storage.managed.get.callCount, j,
        'not called');
      /*
      assert.strictEqual(browser.storage.session.get.callCount, k,
        'not called');
      */
      assert.strictEqual(browser.storage.sync.get.callCount, l, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should not call function', async () => {
      const i = browser.storage.local.get.callCount;
      const j = browser.storage.managed.get.callCount;
      // const k = browser.storage.session.get.callCount;
      const l = browser.storage.sync.get.callCount;
      const res = await func('foo', 'bar');
      assert.strictEqual(browser.storage.local.get.callCount, i, 'not called');
      assert.strictEqual(browser.storage.managed.get.callCount, j,
        'not called');
      /*
      assert.strictEqual(browser.storage.session.get.callCount, k,
        'not called');
      */
      assert.strictEqual(browser.storage.sync.get.callCount, l, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.withArgs('foo').resolves({ foo: 'bar' });
      const i = browser.storage.local.get.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, { foo: 'bar' }, 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.withArgs('foo').resolves({ foo: 'bar' });
      const i = browser.storage.local.get.callCount;
      const res = await func('foo', 'local');
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, { foo: 'bar' }, 'result');
    });

    it('should call function', async () => {
      browser.storage.managed.get.withArgs('foo').resolves({ foo: 'bar' });
      const i = browser.storage.managed.get.callCount;
      const res = await func('foo', 'managed');
      assert.strictEqual(browser.storage.managed.get.callCount, i + 1,
        'called');
      assert.deepEqual(res, { foo: 'bar' }, 'result');
    });

    /*
    it('should call function', async () => {
      browser.storage.session.get.withArgs('foo').resolves({ foo: 'bar' });
      const i = browser.storage.session.get.callCount;
      const res = await func('foo', 'session');
      assert.strictEqual(browser.storage.session.get.callCount, i + 1,
        'called');
      assert.deepEqual(res, { foo: 'bar' }, 'result');
    });
    */

    it('should call function', async () => {
      browser.storage.sync.get.withArgs('foo').resolves({ foo: 'bar' });
      const i = browser.storage.sync.get.callCount;
      const res = await func('foo', 'sync');
      assert.strictEqual(browser.storage.sync.get.callCount, i + 1, 'called');
      assert.deepEqual(res, { foo: 'bar' }, 'result');
    });
  });

  describe('remove storage', () => {
    const func = mjs.removeStorage;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.storage.local.remove.callCount;
      const j = browser.storage.managed.remove.callCount;
      // const k = browser.storage.session.remove.callCount;
      const l = browser.storage.sync.remove.callCount;
      await func('foo');
      assert.strictEqual(browser.storage.local.remove.callCount, i,
        'not called');
      assert.strictEqual(browser.storage.managed.remove.callCount, j,
        'not called');
      /*
      assert.strictEqual(browser.storage.session.remove.callCount, k,
        'not called');
      */
      assert.strictEqual(browser.storage.sync.remove.callCount, l,
        'not called');
    });

    it('should not call function', async () => {
      const i = browser.storage.local.remove.callCount;
      const j = browser.storage.managed.remove.callCount;
      // const k = browser.storage.session.remove.callCount;
      const l = browser.storage.sync.remove.callCount;
      await func('foo', 'bar');
      assert.strictEqual(browser.storage.local.remove.callCount, i,
        'not called');
      assert.strictEqual(browser.storage.managed.remove.callCount, j,
        'not called');
      /*
      assert.strictEqual(browser.storage.session.remove.callCount, k,
        'not called');
      */
      assert.strictEqual(browser.storage.sync.remove.callCount, l,
        'not called');
    });

    it('should call function', async () => {
      const i = browser.storage.local.remove.callCount;
      await func('foo');
      assert.strictEqual(browser.storage.local.remove.callCount, i + 1,
        'called');
    });

    it('should call function', async () => {
      const i = browser.storage.local.remove.callCount;
      await func('foo', 'local');
      assert.strictEqual(browser.storage.local.remove.callCount, i + 1,
        'called');
    });

    it('should not call function', async () => {
      const i = browser.storage.managed.remove.callCount;
      await func('foo', 'managed');
      assert.strictEqual(browser.storage.managed.remove.callCount, i,
        'not called');
    });

    /*
    it('should call function', async () => {
      const i = browser.storage.session.remove.callCount;
      await func('foo', 'session');
      assert.strictEqual(browser.storage.session.remove.callCount, i + 1,
        'called');
    });
    */

    it('should call function', async () => {
      const i = browser.storage.sync.remove.callCount;
      await func('foo', 'sync');
      assert.strictEqual(browser.storage.sync.remove.callCount, i + 1,
        'called');
    });
  });

  describe('set storage', () => {
    const func = mjs.setStorage;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.storage.local.set.callCount;
      const j = browser.storage.managed.set.callCount;
      // const k = browser.storage.session.set.callCount;
      const l = browser.storage.sync.set.callCount;
      await func('foo');
      assert.strictEqual(browser.storage.local.set.callCount, i,
        'not called');
      assert.strictEqual(browser.storage.managed.set.callCount, j,
        'not called');
      /*
      assert.strictEqual(browser.storage.session.set.callCount, k,
        'not called');
      */
      assert.strictEqual(browser.storage.sync.set.callCount, l, 'not called');
    });

    it('should not call function if first argument is falsy', async () => {
      const i = browser.storage.local.set.callCount;
      await func();
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
    });

    it('should call function', async () => {
      const i = browser.storage.local.set.callCount;
      await func('foo');
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
    });

    it('should call function', async () => {
      const i = browser.storage.local.set.callCount;
      await func('foo', 'local');
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
    });

    it('should not call function', async () => {
      const i = browser.storage.managed.set.callCount;
      await func('foo', 'managed');
      assert.strictEqual(browser.storage.managed.set.callCount, i,
        'not called');
    });

    /*
    it('should call function', async () => {
      const i = browser.storage.session.set.callCount;
      await func('foo', 'session');
      assert.strictEqual(browser.storage.session.set.callCount, i + 1,
        'called');
    });
    */

    it('should call function', async () => {
      const i = browser.storage.sync.set.callCount;
      await func('foo', 'sync');
      assert.strictEqual(browser.storage.sync.set.callCount, i + 1, 'called');
    });
  });

  describe('create tab', () => {
    const func = mjs.createTab;

    it('should get object', async () => {
      browser.tabs.create.withArgs(null).resolves({});
      const res = await func();
      assert.deepEqual(res, {}, 'result');
    });

    it('should get object', async () => {
      browser.tabs.create.withArgs(null).resolves({});
      const res = await func({});
      assert.deepEqual(res, {}, 'result');
    });

    it('should get object', async () => {
      const opt = {
        foo: 'bar'
      };
      browser.tabs.create.withArgs(opt).resolves({});
      const res = await func(opt);
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('duplicate tab', () => {
    const func = mjs.duplicateTab;

    it('should throw', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number but got Undefined.'));
      });
    });

    it('should get object', async () => {
      browser.tabs.duplicate.withArgs(1, null).resolves({});
      const res = await func(1);
      assert.deepEqual(res, {}, 'result');
    });

    it('should get object', async () => {
      const opt = {
        active: true
      };
      browser.tabs.duplicate.withArgs(1, opt).resolves({});
      const res = await func(1, opt);
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('query tabs', async () => {
    const func = mjs.queryTabs;

    it('should call function', async () => {
      const i = browser.tabs.query.withArgs({}).callCount;
      browser.tabs.query.resolves([{}]);
      browser.tabs.query.withArgs({}).resolves([{}, {}]);
      const res = await func({});
      assert.strictEqual(browser.tabs.query.withArgs({}).callCount, i + 1,
        'called');
      assert.deepEqual(res, [{}, {}], 'result');
    });
  });

  describe('execute content script to existing tab', () => {
    const func = mjs.execScriptToTab;

    it('should get null if no argument given', async () => {
      const res = await func();
      assert.deepEqual(res, null, 'result');
    });

    it('should call function', async () => {
      const stubErr = sinon.stub(console, 'error');
      const file = '/foo/bar';
      const i = browser.tabs.executeScript.withArgs(1, {
        file
      }).callCount;
      browser.tabs.executeScript.withArgs(1, {
        file
      }).resolves([{}]);
      const res = await func(1, { file });
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(browser.tabs.executeScript.withArgs(1, {
        file
      }).callCount, i + 1, 'called');
      assert.strictEqual(errCalled, false, 'error not called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should log error', async () => {
      const stubErr = sinon.stub(console, 'error');
      const file = '/foo/bar';
      const i = browser.tabs.executeScript.withArgs(1, {
        file
      }).callCount;
      browser.tabs.executeScript.withArgs(1, {
        file
      }).rejects(new Error('error'));
      const res = await func(1, { file });
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(browser.tabs.executeScript.withArgs(1, {
        file
      }).callCount, i + 1, 'called');
      assert.strictEqual(errCalled, true, 'error called');
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      const stubErr = sinon.stub(console, 'error');
      const file = '/foo/bar';
      const i = browser.tabs.executeScript.withArgs({
        file
      }).callCount;
      browser.tabs.executeScript.withArgs({
        file
      }).resolves([{}]);
      const res = await func({ file });
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(browser.tabs.executeScript.withArgs({
        file
      }).callCount, i + 1, 'called');
      assert.strictEqual(errCalled, false, 'error not called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should log error', async () => {
      const stubErr = sinon.stub(console, 'error');
      const file = '/foo/bar';
      const i = browser.tabs.executeScript.withArgs({
        file
      }).callCount;
      browser.tabs.executeScript.withArgs({
        file
      }).rejects(new Error('error'));
      const res = await func({ file });
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(browser.tabs.executeScript.withArgs({
        file
      }).callCount, i + 1, 'called');
      assert.strictEqual(errCalled, true, 'error called');
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      const stubErr = sinon.stub(console, 'error');
      const file = '/foo/bar';
      const i = browser.tabs.executeScript.withArgs({
        file
      }).callCount;
      browser.tabs.executeScript.withArgs({
        file
      }).resolves([{}]);
      const res = await func(null, { file });
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(browser.tabs.executeScript.withArgs({
        file
      }).callCount, i + 1, 'called');
      assert.strictEqual(errCalled, false, 'error not called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should log error', async () => {
      const stubErr = sinon.stub(console, 'error');
      const file = '/foo/bar';
      const i = browser.tabs.executeScript.withArgs({
        file
      }).callCount;
      browser.tabs.executeScript.withArgs({
        file
      }).rejects(new Error('error'));
      const res = await func(null, { file });
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(browser.tabs.executeScript.withArgs({
        file
      }).callCount, i + 1, 'called');
      assert.strictEqual(errCalled, true, 'error called');
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('execute content script to existing tabs', () => {
    const func = mjs.execScriptToTabs;

    it('should call function', async () => {
      const stubErr = sinon.stub(console, 'error');
      const i = browser.tabs.executeScript.withArgs(1, {}).callCount;
      const j = browser.tabs.executeScript.withArgs(2, {}).callCount;
      browser.tabs.query.resolves([
        {
          id: 1,
          url: 'https://example.com'
        },
        {
          id: 2,
          url: 'https://example.net'
        },
        {
          id: 3,
          url: 'about:blank'
        }
      ]);
      browser.tabs.executeScript.withArgs(1, {}).resolves([{}]);
      browser.tabs.executeScript.withArgs(2, {}).rejects(new Error('error'));
      const res = await func();
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(browser.tabs.executeScript.withArgs(1, {}).callCount,
        i + 1, 'called');
      assert.strictEqual(browser.tabs.executeScript.withArgs(2, {}).callCount,
        j + 1, 'called');
      assert.strictEqual(errCalled, true, 'error called');
      assert.deepEqual(res, [[{}], false], 'result');
    });

    it('should call function', async () => {
      const stubErr = sinon.stub(console, 'error');
      const file = '/foo/bar';
      const i = browser.tabs.executeScript.withArgs(1, {
        file,
        allFrames: true
      }).callCount;
      const j = browser.tabs.executeScript.withArgs(2, {
        file,
        allFrames: true
      }).callCount;
      browser.tabs.query.resolves([
        {
          id: 1,
          url: 'https://example.com'
        },
        {
          id: 2,
          url: 'https://example.net'
        },
        {
          id: 3,
          url: 'about:blank'
        }
      ]);
      browser.tabs.executeScript.withArgs(1, {
        file,
        allFrames: true
      }).resolves([{}, {}]);
      browser.tabs.executeScript.withArgs(2, {
        file,
        allFrames: true
      }).rejects(new Error('error'));
      const res = await func({
        file,
        allFrames: true
      });
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(browser.tabs.executeScript.withArgs(1, {
        file,
        allFrames: true
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.executeScript.withArgs(2, {
        file,
        allFrames: true
      }).callCount, j + 1, 'called');
      assert.strictEqual(errCalled, true, 'error called');
      assert.deepEqual(res, [[{}, {}], false], 'result');
    });
  });

  describe('execute scripts to tab in order', () => {
    const func = mjs.execScriptsToTabInOrder;

    it('should get null if no arguments given', async () => {
      const res = await func();
      assert.deepEqual(res, null, 'result');
    });

    it('should get null if no opts given', async () => {
      const i = browser.tabs.executeScript.callCount;
      const res = await func(1);
      assert.strictEqual(browser.tabs.executeScript.callCount, i, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get null if opts is empty array', async () => {
      const i = browser.tabs.executeScript.callCount;
      const res = await func(1, []);
      assert.strictEqual(browser.tabs.executeScript.callCount, i, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get null if opts is empty array', async () => {
      const i = browser.tabs.executeScript.callCount;
      const res = await func([]);
      assert.strictEqual(browser.tabs.executeScript.callCount, i, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get null if opts is empty array', async () => {
      const i = browser.tabs.executeScript.callCount;
      const res = await func(null, []);
      assert.strictEqual(browser.tabs.executeScript.callCount, i, 'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get result', async () => {
      const stubErr = sinon.stub(console, 'error');
      const opt = {
        file: '/foo/bar'
      };
      const opt2 = {
        file: '/baz/qux'
      };
      const i = browser.tabs.executeScript.withArgs(1, opt).callCount;
      const j = browser.tabs.executeScript.withArgs(1, opt2).callCount;
      browser.tabs.executeScript.withArgs(1, opt).rejects(new Error('error'));
      browser.tabs.executeScript.withArgs(1, opt2).resolves([{}]);
      const opts = [opt, opt2];
      const res = await func(1, opts);
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(browser.tabs.executeScript.withArgs(1, opt).callCount,
        i + 1, 'called');
      assert.strictEqual(browser.tabs.executeScript.withArgs(1, opt2).callCount,
        j + 1, 'called');
      assert.strictEqual(errCalled, true, 'error called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should get result', async () => {
      const stubErr = sinon.stub(console, 'error');
      const opt = {
        file: '/foo/bar'
      };
      const opt2 = {
        file: '/baz/qux'
      };
      const i = browser.tabs.executeScript.withArgs(opt).callCount;
      const j = browser.tabs.executeScript.withArgs(opt2).callCount;
      browser.tabs.executeScript.withArgs(opt).rejects(new Error('error'));
      browser.tabs.executeScript.withArgs(opt2).resolves([{}]);
      const opts = [opt, opt2];
      const res = await func(opts);
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(browser.tabs.executeScript.withArgs(opt).callCount,
        i + 1, 'called');
      assert.strictEqual(browser.tabs.executeScript.withArgs(opt2).callCount,
        j + 1, 'called');
      assert.strictEqual(errCalled, true, 'error called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should get result', async () => {
      const stubErr = sinon.stub(console, 'error');
      const opt = {
        file: '/foo/bar'
      };
      const opt2 = {
        file: '/baz/qux'
      };
      const i = browser.tabs.executeScript.withArgs(opt).callCount;
      const j = browser.tabs.executeScript.withArgs(opt2).callCount;
      browser.tabs.executeScript.withArgs(opt).rejects(new Error('error'));
      browser.tabs.executeScript.withArgs(opt2).resolves([{}]);
      const opts = [opt, opt2];
      const res = await func(null, opts);
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(browser.tabs.executeScript.withArgs(opt).callCount,
        i + 1, 'called');
      assert.strictEqual(browser.tabs.executeScript.withArgs(opt2).callCount,
        j + 1, 'called');
      assert.strictEqual(errCalled, true, 'error called');
      assert.deepEqual(res, [{}], 'result');
    });
  });

  describe('get active tab', () => {
    const func = mjs.getActiveTab;

    it('should get number', async () => {
      browser.tabs.query.resolves([{}]);
      const res = await func(1);
      assert.deepEqual(res, {}, 'result');
    });

    it('should get number', async () => {
      browser.tabs.query.resolves([{}]);
      const res = await func();
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('get active tab ID', () => {
    const func = mjs.getActiveTabId;

    it('should get null', async () => {
      browser.tabs.query.resolves([]);
      const res = await func(1);
      assert.deepEqual(res, null, 'result');
    });

    it('should get number', async () => {
      browser.tabs.query.resolves([
        {
          id: 1
        }
      ]);
      const res = await func(1);
      assert.strictEqual(res, 1, 'result');
    });

    it('should get number', async () => {
      browser.tabs.query.resolves([
        {
          id: 1
        }
      ]);
      const res = await func();
      assert.strictEqual(res, 1, 'result');
    });

    it('should get number', async () => {
      browser.tabs.query.resolves([
        {
          id: browser.tabs.TAB_ID_NONE
        }
      ]);
      const res = await func();
      assert.strictEqual(res, browser.tabs.TAB_ID_NONE, 'result');
    });
  });

  describe('get all tabs in window', () => {
    const func = mjs.getAllTabsInWindow;

    it('should get array', async () => {
      browser.tabs.query.resolves([{}]);
      const res = await func(1);
      assert.deepEqual(res, [{}], 'result');
    });

    it('should get array', async () => {
      browser.tabs.query.resolves([{}]);
      const res = await func();
      assert.deepEqual(res, [{}], 'result');
    });
  });

  describe('get highlighted tab', () => {
    const func = mjs.getHighlightedTab;

    it('should get array', async () => {
      browser.tabs.query.resolves([{}]);
      const res = await func(1);
      assert.deepEqual(res, [{}], 'result');
    });

    it('should get array', async () => {
      browser.tabs.query.resolves([{}]);
      const res = await func();
      assert.deepEqual(res, [{}], 'result');
    });
  });

  describe('get tab', () => {
    const func = mjs.getTab;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number but got Undefined.'));
      });
    });

    it('should throw if argument is not number', async () => {
      await func('').catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number but got String.'));
      });
    });

    it('should get object', async () => {
      browser.tabs.get.withArgs(1).resolves({});
      const res = await func(1);
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('highlight tab', () => {
    const func = mjs.highlightTab;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number or Array but got Undefined.'));
      });
    });

    it('should throw if argument is not number', async () => {
      await func('').catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number or Array but got String.'));
      });
    });

    it('should get object', async () => {
      browser.tabs.highlight.resolves({});
      const res = await func(1);
      assert.deepEqual(res, {}, 'result');
    });

    it('should get object', async () => {
      browser.tabs.highlight.resolves({});
      const res = await func(1, 2);
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('move tab', () => {
    const func = mjs.moveTab;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number or Array but got Undefined.'));
      });
    });

    it('should throw if argument is not number', async () => {
      await func('').catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number or Array but got String.'));
      });
    });

    it('should get null', async () => {
      const res = await func(1);
      assert.deepEqual(res, null, 'res');
    });

    it('should get array', async () => {
      browser.tabs.move.withArgs(1).resolves({});
      const res = await func(1);
      assert.deepEqual(res, [{}], 'res');
    });

    it('should get array', async () => {
      browser.tabs.move.withArgs(1, { foo: 'bar' }).resolves({});
      const res = await func(1, { foo: 'bar' });
      assert.deepEqual(res, [{}], 'res');
    });

    it('should get array', async () => {
      browser.tabs.move.withArgs([1, 2]).resolves([{}, {}]);
      const res = await func([1, 2]);
      assert.deepEqual(res, [{}, {}], 'res');
    });

    it('should get array', async () => {
      browser.tabs.move.withArgs([1, 2]).resolves([]);
      const res = await func([1, 2]);
      assert.deepEqual(res, [], 'res');
    });
  });

  describe('reload tab', () => {
    const func = mjs.reloadTab;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number but got Undefined.'));
      });
    });

    it('should throw if argument is not number', async () => {
      await func('').catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number but got String.'));
      });
    });

    it('should call function', async () => {
      const i = browser.tabs.reload.withArgs(1, null).callCount;
      await func(1);
      assert.strictEqual(browser.tabs.reload.withArgs(1, null).callCount, i + 1,
        'res');
    });

    it('should call function', async () => {
      const i = browser.tabs.reload.withArgs(1, { foo: 'bar' }).callCount;
      await func(1, { foo: 'bar' });
      assert.strictEqual(
        browser.tabs.reload.withArgs(1, { foo: 'bar' }).callCount,
        i + 1, 'res'
      );
    });
  });

  describe('remove tab', () => {
    const func = mjs.removeTab;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Array but got Undefined.'));
      });
    });

    it('should throw if argument is not number or array', async () => {
      await func('').catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Array but got String.'));
      });
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.callCount;
      await func(1);
      assert.strictEqual(browser.tabs.remove.callCount, i + 1, 'res');
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.callCount;
      await func([1]);
      assert.strictEqual(browser.tabs.remove.callCount, i + 1, 'res');
    });
  });

  describe('update tab', () => {
    const func = mjs.updateTab;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number but got Undefined.'));
      });
    });

    it('should throw if argument is not number', async () => {
      await func('').catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number but got String.'));
      });
    });

    it('should throw if tab does not exist', async () => {
      browser.tabs.update.withArgs(1).throws(new Error('error'));
      await func(1).catch(e => {
        assert.deepStrictEqual(e, new Error('error'));
      });
    });

    it('should get object', async () => {
      browser.tabs.update.withArgs(1).resolves({});
      const i = browser.tabs.update.withArgs(1).callCount;
      const res = await func(1);
      assert.strictEqual(browser.tabs.update.withArgs(1).callCount, i + 1,
        'called');
      assert.strictEqual(typeof res, 'object', 'res');
    });

    it('should get object', async () => {
      browser.tabs.update.withArgs(1, { foo: 'bar' }).resolves({});
      const i = browser.tabs.update.withArgs(1, { foo: 'bar' }).callCount;
      const res = await func(1, { foo: 'bar' });
      assert.strictEqual(
        browser.tabs.update.withArgs(1, { foo: 'bar' }).callCount,
        i + 1,
        'called'
      );
      assert.strictEqual(typeof res, 'object', 'res');
    });
  });

  describe('warmup tab', () => {
    const func = mjs.warmupTab;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number but got Undefined.'));
      });
    });

    it('should throw if argument is not number', async () => {
      await func('').catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number but got String.'));
      });
    });

    it('should call function', async () => {
      if (typeof browser.tabs.warmup === 'function') {
        const i = browser.tabs.warmup.callCount;
        await func(1);
        assert.strictEqual(browser.tabs.warmup.callCount, i + 1, 'called');
      }
    });
  });

  describe('capture visible tab', () => {
    const func = mjs.captureVisibleTab;

    it('should not call function if permission is not granted', async () => {
      browser.runtime.getBrowserInfo.resolves({
        vender: 'Mozilla',
        version: '125.0.1'
      });
      browser.permissions.contains.withArgs({
        origins: ['<all_urls>']
      }).resolves(false);
      const i = browser.tabs.captureVisibleTab.callCount;
      const res = await func();
      assert.strictEqual(browser.tabs.captureVisibleTab.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should call function', async () => {
      browser.runtime.getBrowserInfo.resolves({
        vender: 'Mozilla',
        version: '125.0.1'
      });
      browser.permissions.contains.withArgs({
        origins: ['<all_urls>']
      }).resolves(true);
      const i = browser.tabs.captureVisibleTab.callCount;
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
      browser.tabs.captureVisibleTab.withArgs(windowId, {
        format: 'png'
      }).resolves(url);
      const res = await func();
      assert.strictEqual(browser.tabs.captureVisibleTab.callCount, i + 1,
        'called');
      assert.strictEqual(res, url, 'result');
    });

    it('should not call function if permission is not granted', async () => {
      browser.runtime.getBrowserInfo.resolves({
        vender: 'Mozilla',
        version: '126.0.a1'
      });
      browser.permissions.contains.withArgs({
        permissions: ['activeTab']
      }).resolves(false);
      browser.permissions.contains.withArgs({
        origins: ['<all_urls>']
      }).resolves(false);
      const i = browser.tabs.captureVisibleTab.callCount;
      const res = await func();
      assert.strictEqual(browser.tabs.captureVisibleTab.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should call function', async () => {
      browser.runtime.getBrowserInfo.resolves({
        vender: 'Mozilla',
        version: '126.0a1'
      });
      browser.permissions.contains.withArgs({
        permissions: ['activeTab']
      }).resolves(false);
      browser.permissions.contains.withArgs({
        origins: ['<all_urls>']
      }).resolves(true);
      const i = browser.tabs.captureVisibleTab.callCount;
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
      browser.tabs.captureVisibleTab.withArgs(windowId, {
        format: 'png'
      }).resolves(url);
      const res = await func();
      assert.strictEqual(browser.tabs.captureVisibleTab.callCount, i + 1,
        'called');
      assert.strictEqual(res, url, 'result');
    });

    it('should call function', async () => {
      browser.runtime.getBrowserInfo.resolves({
        vender: 'Mozilla',
        version: '126.0a1'
      });
      browser.permissions.contains.withArgs({
        permissions: ['activeTab']
      }).resolves(true);
      browser.permissions.contains.withArgs({
        origins: ['<all_urls>']
      }).resolves(false);
      const i = browser.tabs.captureVisibleTab.callCount;
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
      browser.tabs.captureVisibleTab.withArgs(windowId, {
        format: 'png'
      }).resolves(url);
      const res = await func();
      assert.strictEqual(browser.tabs.captureVisibleTab.callCount, i + 1,
        'called');
      assert.strictEqual(res, url, 'result');
    });

    it('should not call function if permission is not granted', async () => {
      browser.runtime.getBrowserInfo.resolves({
        vender: 'Foo',
        version: '126.0.1'
      });
      browser.permissions.contains.withArgs({
        permissions: ['activeTab']
      }).resolves(false);
      browser.permissions.contains.withArgs({
        origins: ['<all_urls>']
      }).resolves(false);
      const i = browser.tabs.captureVisibleTab.callCount;
      const res = await func();
      assert.strictEqual(browser.tabs.captureVisibleTab.callCount, i,
        'not called');
      assert.deepEqual(res, null, 'result');
    });

    it('should call function', async () => {
      browser.runtime.getBrowserInfo.resolves({
        vender: 'Foo',
        version: '126.0.1'
      });
      browser.permissions.contains.withArgs({
        permissions: ['activeTab']
      }).resolves(true);
      browser.permissions.contains.withArgs({
        origins: ['<all_urls>']
      }).resolves(false);
      const i = browser.tabs.captureVisibleTab.callCount;
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
      browser.tabs.captureVisibleTab.withArgs(windowId, {
        format: 'png'
      }).resolves(url);
      const res = await func();
      assert.strictEqual(browser.tabs.captureVisibleTab.callCount, i + 1,
        'called');
      assert.strictEqual(res, url, 'result');
    });

    it('should call function', async () => {
      browser.runtime.getBrowserInfo.resolves({
        vender: 'Foo',
        version: '126.0.1'
      });
      browser.permissions.contains.withArgs({
        permissions: ['activeTab']
      }).resolves(false);
      browser.permissions.contains.withArgs({
        origins: ['<all_urls>']
      }).resolves(true);
      const i = browser.tabs.captureVisibleTab.callCount;
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
      browser.tabs.captureVisibleTab.withArgs(windowId, {
        format: 'png'
      }).resolves(url);
      const res = await func(windowId, {
        format: 'png'
      });
      assert.strictEqual(browser.tabs.captureVisibleTab.callCount, i + 1,
        'called');
      assert.strictEqual(res, url, 'result');
    });
  });

  describe('is tab', () => {
    const func = mjs.isTab;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number but got Undefined.'));
      });
    });

    it('should throw if argument is not number', async () => {
      await func('').catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number but got String.'));
      });
    });

    it('should get result', async () => {
      const res = await func(-1);
      assert.strictEqual(res, false, 'res');
    });

    it('should get result', async () => {
      const e = new Error('error');
      browser.tabs.get.withArgs(1).rejects(e);
      const res = await func(1);
      assert.strictEqual(res, false, 'res');
    });

    it('should get result', async () => {
      browser.tabs.get.withArgs(1).resolves({});
      const res = await func(1);
      assert.strictEqual(res, true, 'res');
    });
  });

  describe('getCurrentTheme', () => {
    const func = mjs.getCurrentTheme;

    it('should not call function if permission is not granted', async () => {
      browser.permissions.contains.resolves(false);
      const i = browser.theme.getCurrent.callCount;
      await func('foo');
      assert.strictEqual(browser.theme.getCurrent.callCount, i,
        'not called');
    });

    it('should get function called and get result', async () => {
      browser.theme.getCurrent.resolves({});
      const i = browser.theme.getCurrent.callCount;
      const res = await func();
      assert.strictEqual(browser.theme.getCurrent.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should get function called and get result', async () => {
      browser.theme.getCurrent.withArgs(1).resolves({});
      const i = browser.theme.getCurrent.callCount;
      const res = await func(1);
      assert.strictEqual(browser.theme.getCurrent.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('create new window', () => {
    const func = mjs.createNewWindow;

    it('should get function called and get result', async () => {
      browser.windows.create.withArgs(null).resolves(null);
      const i = browser.windows.create.callCount;
      const res = await func();
      assert.strictEqual(browser.windows.create.callCount, i + 1, 'called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get function called and get result', async () => {
      browser.windows.create.withArgs(null).resolves(null);
      const i = browser.windows.create.callCount;
      const res = await func();
      assert.strictEqual(browser.windows.create.callCount, i + 1, 'called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get function called and get result', async () => {
      const opt = {
        foo: 'bar'
      };
      browser.windows.create.withArgs(opt).resolves(opt);
      const i = browser.windows.create.callCount;
      const res = await func(opt);
      assert.strictEqual(browser.windows.create.callCount, i + 1, 'called');
      assert.deepEqual(res, opt, 'result');
    });
  });

  describe('get all normal windows', () => {
    const func = mjs.getAllNormalWindows;

    it('should get function called and get result', async () => {
      browser.windows.getAll.withArgs({
        populate: false,
        windowTypes: ['normal']
      }).resolves([]);
      const i = browser.windows.getAll.withArgs({
        populate: false,
        windowTypes: ['normal']
      }).callCount;
      const res = await func();
      assert.strictEqual(browser.windows.getAll.callCount, i + 1, 'called');
      assert.strictEqual(Array.isArray(res), true, 'result');
    });

    it('should get function called and get result', async () => {
      browser.windows.getAll.withArgs({
        populate: true,
        windowTypes: ['normal']
      }).resolves([]);
      const i = browser.windows.getAll.withArgs({
        populate: true,
        windowTypes: ['normal']
      }).callCount;
      const res = await func(true);
      assert.strictEqual(browser.windows.getAll.callCount, i + 1, 'called');
      assert.strictEqual(Array.isArray(res), true, 'result');
    });
  });

  describe('get current window', () => {
    const func = mjs.getCurrentWindow;

    it('should get function called and get result', async () => {
      browser.windows.getCurrent.withArgs(null).resolves(null);
      const i = browser.windows.getCurrent.callCount;
      const res = await func();
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1, 'called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get function called and get result', async () => {
      browser.windows.getCurrent.withArgs(null).resolves(null);
      const i = browser.windows.getCurrent.callCount;
      const res = await func();
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1, 'called');
      assert.deepEqual(res, null, 'result');
    });

    it('should get function called and get result', async () => {
      const opt = {
        foo: 'bar'
      };
      browser.windows.getCurrent.withArgs(opt).resolves({});
      const i = browser.windows.getCurrent.callCount;
      const res = await func(opt);
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('get window', () => {
    const func = mjs.getWindow;

    it('should throw', async () => {
      await func().catch(e => {
        assert.deepStrictEqual(e,
          new TypeError('Expected Number but got Undefined.'));
      });
    });

    it('should get result', async () => {
      browser.windows.get.withArgs(1, null).resolves({});
      const i = browser.windows.get.callCount;
      const res = await func(1);
      assert.strictEqual(browser.windows.get.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should get result', async () => {
      browser.windows.get.withArgs(1, {
        populate: true
      }).resolves({});
      const i = browser.windows.get.callCount;
      const res = await func(1, {
        populate: true
      });
      assert.strictEqual(browser.windows.get.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('check whether incognito window exists', () => {
    const func = mjs.checkIncognitoWindowExists;

    it('should get result', async () => {
      browser.windows.getAll.resolves([]);
      const res = await func();
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      browser.windows.getAll.resolves([
        {
          incognito: false
        },
        {
          incognito: false
        }
      ]);
      const res = await func();
      assert.strictEqual(res, false, 'result');
    });

    it('should get result', async () => {
      browser.windows.getAll.resolves([
        {
          incognito: false
        },
        {
          incognito: true
        }
      ]);
      const res = await func();
      assert.strictEqual(res, true, 'result');
    });
  });
});
