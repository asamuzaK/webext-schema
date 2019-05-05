/* eslint-disable max-nested-callbacks */
"use strict";
/* api */
const {Schema} = require("../modules/schema");
const Api = require("sinon-chrome/api");
const {assert} = require("chai");
const {describe, it} = require("mocha");

describe("Schema", () => {
  it("should be instance of Schema", () => {
    const schema = new Schema();
    assert.instanceOf(schema, Schema);
  });

  describe("getter", () => {
    it("should get value", () => {
      const schema = new Schema();
      assert.strictEqual(schema.channel, "release");
    });

    it("should get value", () => {
      const schema = new Schema("foo");
      assert.strictEqual(schema.channel, "release");
    });

    it("should get value", () => {
      const schema = new Schema("beta");
      assert.strictEqual(schema.channel, "beta");
    });

    it("should get value", () => {
      const schema = new Schema("central");
      assert.strictEqual(schema.channel, "central");
    });
  });

  describe("setter", () => {
    it("should set value", () => {
      const schema = new Schema();
      schema.channel = true;
      assert.strictEqual(schema.channel, "release");
    });

    it("should set value", () => {
      const schema = new Schema();
      schema.channel = "foo";
      assert.strictEqual(schema.channel, "release");
    });

    it("should set value", () => {
      const schema = new Schema();
      schema.channel = "beta";
      assert.strictEqual(schema.channel, "beta");
    });

    it("should set value", () => {
      const schema = new Schema();
      schema.channel = "central";
      assert.strictEqual(schema.channel, "central");
    });

    it("should set value", () => {
      const schema = new Schema("beta");
      schema.channel = "release";
      assert.strictEqual(schema.channel, "release");
    });
  });

  describe("parse content", () => {
    it("should get object", () => {
      const schema = new Schema();
      const res = schema._parseSchemaContent();
      assert.isObject(res, "result");
      const keys = Object.keys(res);
      for (const key of keys) {
        assert.isTrue(key.endsWith(".json"), "key");
      }
    });

    it("should get object", () => {
      const schema = new Schema("release");
      const res = schema._parseSchemaContent();
      assert.isObject(res, "result");
      const keys = Object.keys(res);
      for (const key of keys) {
        assert.isTrue(key.endsWith(".json"), "key");
      }
    });

    it("should get object", () => {
      const schema = new Schema("beta");
      const res = schema._parseSchemaContent();
      assert.isObject(res, "result");
      const keys = Object.keys(res);
      for (const key of keys) {
        assert.isTrue(key.endsWith(".json"), "key");
      }
    });

    it("should get object", () => {
      const schema = new Schema("central");
      const res = schema._parseSchemaContent();
      assert.isObject(res, "result");
      const keys = Object.keys(res);
      for (const key of keys) {
        assert.isTrue(key.endsWith(".json"), "key");
      }
    });
  });

  describe("arrange schema to fit specific application", () => {
    it("should throw", () => {
      const schema = new Schema();
      assert.throws(() => schema.arrange(),
                    "Expected String but got Undefined.");
    });

    it("should get null", () => {
      const schema = new Schema();
      const res = schema.arrange({name: "foo"});
      assert.isNull(res, "result");
    });

    it("should get array", () => {
      const schema = new Schema();
      const res = schema.arrange({name: "sinon-chrome"});
      assert.isArray(res, "result");
    });
  });

  describe("get schema", () => {
    it("should throw", () => {
      const schema = new Schema();
      assert.throws(() => schema.get(),
                    "Expected String but got Undefined.");
    });

    it("should get null", () => {
      const schema = new Schema();
      const res = schema.get("foo");
      assert.isNull(res, "result");
    });

    it("should get array", () => {
      const schema = new Schema();
      const res = schema.get("browser_action.json");
      assert.isArray(res, "result");
    });

    it("should get array", () => {
      const schema = new Schema();
      const res = schema.get("browser_action");
      assert.isArray(res, "result");
    });

    it("should get array", () => {
      const schema = new Schema();
      const res = schema.get("browserAction");
      assert.isArray(res, "result");
    });
  });

  describe("get all schemas", () => {
    it("should get object", () => {
      const schema = new Schema();
      const res = schema.getAll();
      assert.isObject(res, "result");
      const keys = Object.keys(res);
      for (const key of keys) {
        assert.isTrue(key.endsWith(".json"), "key");
      }
    });
  });

  describe("list schemas", () => {
    it("should get array", () => {
      const schema = new Schema();
      const res = schema.list();
      assert.isArray(res, "result");
      for (const key of res) {
        assert.isTrue(key.endsWith(".json"), "key");
      }
    });

    it("should get array", () => {
      const schema = new Schema("release");
      const res = schema.list();
      assert.isArray(res, "result");
      for (const key of res) {
        assert.isTrue(key.endsWith(".json"), "key");
      }
    });

    it("should get array", () => {
      const schema = new Schema("beta");
      const res = schema.list();
      assert.isArray(res, "result");
      for (const key of res) {
        assert.isTrue(key.endsWith(".json"), "key");
      }
    });

    it("should get array", () => {
      const schema = new Schema("central");
      const res = schema.list();
      assert.isArray(res, "result");
      for (const key of res) {
        assert.isTrue(key.endsWith(".json"), "key");
      }
    });
  });
});

describe("application support", () => {
  describe("sinon-chrome", () => {
    it("should get stubbed functions", () => {
      const schema = new Schema().arrange({name: "sinon-chrome"});
      const browser = new Api(schema).create();
      assert.isObject(browser, "browser");
      const {
        bookmarks, browserAction, commands, contextMenus, contextualIdentities,
        devtools: {inspectedWindow}, i18n, management, menus, notifications,
        permissions, runtime, sessions, storage, tabs, theme, windows,
      } = browser;
      assert.isObject(bookmarks, "bookmarks");
      assert.isFunction(bookmarks.create, "bookmarks.create");
      assert.isObject(browserAction, "browserAction");
      assert.isFunction(browserAction.setTitle, "browserAction.setTitle");
      assert.isObject(commands, "commands");
      assert.isFunction(commands.update, "commands.update");
      assert.isObject(contextMenus, "contextMenus");
      assert.isFunction(contextMenus.create, "contextMenus.create");
      assert.isObject(contextualIdentities, "contextualIdentities");
      assert.isFunction(contextualIdentities.get, "contextualIdentities.get");
      assert.isObject(inspectedWindow, "inspectedWindow");
      assert.isFunction(inspectedWindow.reload, "inspectedWindow.reload");
      assert.isObject(i18n, "i18n");
      assert.isFunction(i18n.getMessage, "i18n.getMessage");
      assert.isObject(management, "management");
      assert.isFunction(management.get, "management.get");
      assert.isObject(menus, "menus");
      assert.isFunction(menus.create, "menus.create");
      assert.isFunction(menus.getTargetElement, "menus.getTargetElement");
      assert.isObject(notifications, "notifications");
      assert.isFunction(notifications.create, "notifications.create");
      assert.isObject(notifications.onClosed, "notifications.onClosed");
      assert.isFunction(notifications.onClosed.addListener,
                        "notifications.onClosed.addListener");
      assert.isObject(permissions, "permissions");
      assert.isFunction(permissions.request, "permissions.request");
      assert.isObject(runtime, "runtime");
      assert.isFunction(runtime.connect, "runtime.connect");
      assert.isObject(sessions, "sessions");
      assert.isFunction(sessions.getRecentlyClosed,
                        "sessions.getRecentlyClosed");
      assert.isObject(storage, "storage");
      assert.isObject(storage.local, "storage.local");
      assert.isFunction(storage.local.get, "storage.local.get");
      assert.isObject(storage.onChanged, "storage.onChanged");
      assert.isFunction(storage.onChanged.addListener,
                        "storage.onChanged.addListener");
      assert.isObject(tabs, "tabs");
      assert.isFunction(tabs.get, "tabs.get");
      assert.isObject(theme, "theme");
      assert.isFunction(theme.getCurrent, "theme.getCurrent");
      assert.isObject(windows, "windows");
      assert.isFunction(windows.get, "windows.get");
    });
  });
});
