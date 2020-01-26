/* eslint-disable max-nested-callbacks, no-magic-numbers */
"use strict";
/* api */
const {Schema} = require("../modules/schema");
const {assert} = require("chai");
const {describe, it} = require("mocha");

describe("Schema", () => {
  describe("construct", () => {
    it("should be instance of Schema", () => {
      const schema = new Schema();
      assert.instanceOf(schema, Schema, "instance");
      assert.strictEqual(schema.channel, "beta", "channel");
      assert.isObject(schema._sandbox, "sandbox");
    });

    it("should be instance of Schema", () => {
      const schema = new Schema("central");
      assert.instanceOf(schema, Schema, "instance");
      assert.strictEqual(schema.channel, "central", "channel");
      assert.isObject(schema._sandbox, "sandbox");
    });

    it("should be instance of Schema", () => {
      const config = {
        injectInto: null,
        properties: ["spy", "stub", "mock"],
        useFakeTimers: true,
        useFakeServer: true,
      };
      const schema = new Schema(config);
      assert.instanceOf(schema, Schema, "instance");
      assert.strictEqual(schema.channel, "beta", "channel");
      assert.isObject(schema._sandbox, "sandbox");
    });

    it("should be instance of Schema", () => {
      const config = {
        injectInto: null,
        properties: ["spy", "stub", "mock"],
        useFakeTimers: true,
        useFakeServer: true,
      };
      const schema = new Schema("central", config);
      assert.instanceOf(schema, Schema, "instance");
      assert.strictEqual(schema.channel, "central", "channel");
      assert.isObject(schema._sandbox, "sandbox");
    });
  });

  describe("getter", () => {
    it("should get default value", () => {
      const schema = new Schema();
      assert.strictEqual(schema.channel, "beta");
    });

    it("should get default value", () => {
      const schema = new Schema("foo");
      assert.strictEqual(schema.channel, "beta");
    });

    it("should get value", () => {
      const schema = new Schema("beta");
      assert.strictEqual(schema.channel, "beta");
    });

    it("should get value", () => {
      const schema = new Schema("central");
      assert.strictEqual(schema.channel, "central");
    });

    it("should get value", () => {
      const schema = new Schema("release");
      assert.strictEqual(schema.channel, "release");
    });

    it("should get value", () => {
      const schema = new Schema("mail");
      assert.strictEqual(schema.channel, "mail");
    });
  });

  describe("setter", () => {
    it("should set default value", () => {
      const schema = new Schema();
      schema.channel = 1;
      assert.strictEqual(schema.channel, "beta");
    });

    it("should set default value", () => {
      const schema = new Schema();
      schema.channel = "foo";
      assert.strictEqual(schema.channel, "beta");
    });

    it("should set value", () => {
      const schema = new Schema();
      schema.channel = "central";
      assert.strictEqual(schema.channel, "central");
    });

    it("should set value", () => {
      const schema = new Schema();
      schema.channel = "release";
      assert.strictEqual(schema.channel, "release");
    });

    it("should set value", () => {
      const schema = new Schema();
      schema.channel = "mail";
      assert.strictEqual(schema.channel, "mail");
    });

    it("should set value", () => {
      const schema = new Schema("central");
      schema.channel = "beta";
      assert.strictEqual(schema.channel, "beta");
    });

    it("should set value", () => {
      const schema = new Schema("central");
      schema.channel = "release";
      assert.strictEqual(schema.channel, "release");
    });

    it("should set value", () => {
      const schema = new Schema("mail");
      schema.channel = "release";
      assert.strictEqual(schema.channel, "release");
    });
  });

  describe("get target from namespace", () => {
    it("should get null", () => {
      const schema = new Schema();
      schema._browser = {};
      const res = schema._getTargetFromNamespace();
      assert.isNull(res, "result");
    });

    it("should get null", () => {
      const schema = new Schema();
      schema._browser = {};
      const res = schema._getTargetFromNamespace("");
      assert.isNull(res, "result");
    });

    it("should get null", () => {
      const schema = new Schema();
      schema._browser = {};
      const res = schema._getTargetFromNamespace("foo");
      assert.isNull(res, "result");
    });

    it("should get target object", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {},
      };
      const res = schema._getTargetFromNamespace("foo");
      assert.deepEqual(res, schema._browser.foo, "result");
    });

    it("should get null", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          bar: {},
        },
      };
      const res = schema._getTargetFromNamespace("foo.baz");
      assert.isNull(res, "result");
    });

    it("should get target object", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          bar: {},
        },
      };
      const res = schema._getTargetFromNamespace("foo.bar");
      assert.deepEqual(res, schema._browser.foo.bar, "result");
    });

    it("should get target object", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          bar: {
            baz: {},
          },
        },
      };
      const res = schema._getTargetFromNamespace("foo.bar.baz");
      assert.deepEqual(res, schema._browser.foo.bar.baz, "result");
    });
  });

  describe("assign import map", () => {
    it("should not assign", () => {
      const schema = new Schema();
      schema._browser = {};
      schema._assignImportMap();
      assert.deepEqual(schema._browser, {}, "browser");
      assert.strictEqual(schema._importMap.size, 0, "size");
    });

    it("should not assign", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {},
        },
        bar: {},
      };
      schema._importMap.set("qux", {
        $import: "baz",
        namespace: "foo",
      });
      schema._assignImportMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {},
        },
        bar: {
        },
      }, "browser");
      assert.strictEqual(schema._importMap.size, 0, "size");
    });

    it("should assign", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {},
        },
        bar: {},
      };
      schema._importMap.set("bar", {
        $import: "foo",
        namespace: "bar",
      });
      schema._assignImportMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {},
        },
        bar: {
          baz: {},
        },
      }, "browser");
      assert.strictEqual(schema._importMap.size, 0, "size");
    });

    it("should assign", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {
            qux: {},
          },
        },
        bar: {},
      };
      schema._importMap.set("bar", {
        $import: "foo.baz",
        namespace: "bar",
      });
      schema._assignImportMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {
            qux: {},
          },
        },
        bar: {
          qux: {},
        },
      }, "browser");
      assert.strictEqual(schema._importMap.size, 0, "size");
    });

    it("should assign", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {
            qux: {},
          },
        },
        bar: {
          quux: {},
        },
      };
      schema._importMap.set("bar.quux", {
        $import: "foo.baz",
        namespace: "bar",
      });
      schema._assignImportMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {
            qux: {},
          },
        },
        bar: {
          quux: {
            qux: {},
          },
        },
      }, "browser");
      assert.strictEqual(schema._importMap.size, 0, "size");
    });

    it("should assign", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          bar: {},
          baz: {
            qux: {},
          },
        },
      };
      schema._importMap.set("foo.bar", {
        $import: "baz",
        namespace: "foo",
      });
      schema._assignImportMap();
      assert.deepEqual(schema._browser, {
        foo: {
          bar: {
            qux: {},
          },
          baz: {
            qux: {},
          },
        },
      }, "browser");
      assert.strictEqual(schema._importMap.size, 0, "size");
    });
  });

  describe("assign referred map", () => {
    it("should not assign", () => {
      const schema = new Schema();
      schema._browser = {};
      schema._assignRefMap();
      assert.deepEqual(schema._browser, {}, "browser");
      assert.strictEqual(schema._refMap.size, 0, "size");
    });

    it("should not assign", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {},
        },
        bar: {},
      };
      schema._refMap.set("qux", {
        $ref: "baz",
        namespace: "foo",
      });
      schema._assignRefMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {},
        },
        bar: {
        },
      }, "browser");
      assert.strictEqual(schema._refMap.size, 0, "size");
    });

    it("should assign", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {},
        },
        bar: {},
      };
      schema._refMap.set("bar", {
        $ref: "foo",
        namespace: "bar",
      });
      schema._assignRefMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {},
        },
        bar: {
          baz: {},
        },
      }, "browser");
      assert.strictEqual(schema._refMap.size, 0, "size");
    });

    it("should assign", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {
            qux: {},
          },
        },
        bar: {},
      };
      schema._refMap.set("bar", {
        $ref: "foo.baz",
        namespace: "bar",
      });
      schema._assignRefMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {
            qux: {},
          },
        },
        bar: {
          qux: {},
        },
      }, "browser");
      assert.strictEqual(schema._refMap.size, 0, "size");
    });

    it("should assign", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {
            qux: {},
          },
        },
        bar: {
          quux: {},
        },
      };
      schema._refMap.set("bar.quux", {
        $ref: "foo.baz",
        namespace: "bar",
      });
      schema._assignRefMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {
            qux: {},
          },
        },
        bar: {
          quux: {
            qux: {},
          },
        },
      }, "browser");
      assert.strictEqual(schema._refMap.size, 0, "size");
    });

    it("should assign", () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          bar: {},
          baz: {
            qux: {},
          },
        },
      };
      schema._refMap.set("foo.bar", {
        $ref: "baz",
        namespace: "foo",
      });
      schema._assignRefMap();
      assert.deepEqual(schema._browser, {
        foo: {
          bar: {
            qux: {},
          },
          baz: {
            qux: {},
          },
        },
      }, "browser");
      assert.strictEqual(schema._refMap.size, 0, "size");
    });
  });

  describe("mock events", () => {
    it("should throw", () => {
      const schema = new Schema();
      assert.throws(() => schema._mockEvents());
    });

    it("should throw", () => {
      const schema = new Schema();
      assert.throws(() => schema._mockEvents({}));
    });

    it("should not add listeners", () => {
      const schema = new Schema();
      const res = schema._mockEvents({}, []);
      assert.deepEqual(res, {}, "result");
    });

    it("should not add listeners", () => {
      const schema = new Schema();
      const res = schema._mockEvents({}, [
        {
          name: "foo",
          type: "function",
          unsupported: true,
        },
      ]);
      assert.deepEqual(res, {}, "result");
    });

    it("should not add listeners", () => {
      const schema = new Schema();
      const res = schema._mockEvents({}, [
        {
          name: "foo",
          type: "object",
        },
      ]);
      assert.deepEqual(res, {}, "result");
    });

    it("should add listeners", () => {
      const schema = new Schema();
      const res = schema._mockEvents({}, [
        {
          name: "foo",
          type: "function",
        },
      ]);
      assert.isObject(res, {}, "result");
      assert.isObject(res.foo, {}, "result");
      assert.isFunction(res.foo.addListener, "addListener");
      assert.isFunction(res.foo.hasListener, "hasListener");
      assert.isFunction(res.foo.removeListener, "removeListener");
    });

    it("should add listeners", () => {
      const schema = new Schema();
      const res = schema._mockEvents({
        foo: {},
      }, [
        {
          name: "foo",
          type: "function",
        },
      ]);
      assert.isObject(res, {}, "result");
      assert.isObject(res.foo, {}, "result");
      assert.isFunction(res.foo.addListener, "addListener");
      assert.isFunction(res.foo.hasListener, "hasListener");
      assert.isFunction(res.foo.removeListener, "removeListener");
    });
  });

  describe("mock functions", () => {
    it("should throw", () => {
      const schema = new Schema();
      assert.throws(() => schema._mockFunctions());
    });

    it("should throw", () => {
      const schema = new Schema();
      assert.throws(() => schema._mockFunctions({}));
    });

    it("should not add functions", () => {
      const schema = new Schema();
      const res = schema._mockFunctions({}, []);
      assert.deepEqual(res, {}, "result");
    });

    it("should not add functions", () => {
      const schema = new Schema();
      const res = schema._mockFunctions({}, [
        {
          name: "foo",
          type: "function",
          unsupported: true,
        },
      ]);
      assert.deepEqual(res, {}, "result");
    });

    it("should not add functions", () => {
      const schema = new Schema();
      const res = schema._mockFunctions({}, [
        {
          name: "foo",
          type: "object",
        },
      ]);
      assert.deepEqual(res, {}, "result");
    });

    it("should add functions", () => {
      const schema = new Schema();
      const res = schema._mockFunctions({}, [
        {
          name: "foo",
          type: "function",
        },
      ]);
      assert.isObject(res, {}, "result");
      assert.isFunction(res.foo, "function");
    });

    it("should add functions", () => {
      const schema = new Schema();
      const res = schema._mockFunctions({
        foo: {},
      }, [
        {
          name: "foo",
          type: "function",
        },
      ]);
      assert.isObject(res, {}, "result");
      assert.isFunction(res.foo, "function");
    });
  });

  describe("mock properties", () => {
    it("should throw", () => {
      const schema = new Schema();
      assert.throws(() => schema._mockProperties());
    });

    it("should throw", () => {
      const schema = new Schema();
      assert.throws(() => schema._mockProperties({}));
    });

    it("should throw", () => {
      const schema = new Schema();
      assert.throws(() => schema._mockProperties({}, {}));
    });

    it("should not add properties", () => {
      const schema = new Schema();
      const res = schema._mockProperties({}, {}, "foo");
      assert.deepEqual(res, {}, "result");
    });

    it("should not add properties", () => {
      const schema = new Schema();
      const res = schema._mockProperties({}, {
        bar: {
          name: "baz",
          type: "function",
          unsupported: true,
        },
      }, "foo");
      assert.deepEqual(res, {}, "result");
    });

    it("should set map", () => {
      const schema = new Schema();
      const res = schema._mockProperties({
      }, {
        bar: {
          $ref: "baz",
        },
      }, "foo");
      assert.deepEqual(res, {
        bar: {},
      }, "result");
      assert.deepEqual(Array.from(schema._refMap), [
        [
          "foo.bar",
          {
            $ref: "baz",
            namespace: "foo",
          },
        ],
      ], "map");
    });

    it("should add properties", () => {
      const schema = new Schema();
      const res = schema._mockProperties({
      }, {
        bar: {
          value: -1,
        },
      }, "foo");
      assert.deepEqual(res, {
        bar: -1,
      }, "result");
    });

    it("should add properties", () => {
      const schema = new Schema();
      const res = schema._mockProperties({
      }, {
        bar: {
          type: "function",
        },
      }, "foo");
      assert.isObject(res, "result");
      assert.isFunction(res.bar, "property");
    });

    it("should add properties", () => {
      const schema = new Schema();
      const res = schema._mockProperties({
      }, {
        bar: {
          type: "object",
        },
      }, "foo");
      assert.deepEqual(res, {
        bar: {},
      }, "result");
    });

    it("should add properties", () => {
      const schema = new Schema();
      const res = schema._mockProperties({
        bar: {},
      }, {
        bar: {
          properties: {
            baz: {
              type: "object",
            },
          },
        },
      }, "foo");
      assert.deepEqual(res, {
        bar: {
          baz: {},
        },
      }, "result");
    });

    it("should add properties", () => {
      const schema = new Schema();
      const res = schema._mockProperties({
      }, {
        bar: {
          type: "string",
        },
      }, "foo");
      assert.deepEqual(res, {
        bar: null,
      }, "result");
    });
  });

  describe("mock types", () => {
    it("should throw", () => {
      const schema = new Schema();
      assert.throws(() => schema._mockTypes());
    });

    it("should throw", () => {
      const schema = new Schema();
      assert.throws(() => schema._mockTypes({}));
    });

    it("should throw", () => {
      const schema = new Schema();
      assert.throws(() => schema._mockTypes({}, []));
    });

    it("should not add types", () => {
      const schema = new Schema();
      const res = schema._mockTypes({}, [{}], "foo");
      assert.deepEqual(res, {}, "result");
    });

    it("should set map", () => {
      const schema = new Schema();
      const res = schema._mockTypes({
      }, [
        {
          $import: "bar",
          id: "baz",
        },
      ], "foo");
      assert.deepEqual(res, {
        baz: {},
      }, "result");
      assert.deepEqual(Array.from(schema._importMap), [
        [
          "foo.baz",
          {
            $import: "bar",
            namespace: "foo",
          },
        ],
      ], "map");
    });

    it("should add types", () => {
      const schema = new Schema();
      const res = schema._mockTypes({
      }, [
        {
          id: "baz",
          type: "object",
        },
      ], "foo");
      assert.deepEqual(res, {
        baz: {},
      }, "result");
    });

    it("should add types", () => {
      const schema = new Schema();
      const res = schema._mockTypes({
        baz: {},
      }, [
        {
          events: [],
          functions: [],
          id: "baz",
          properties: {},
          type: "object",
        },
      ], "foo");
      assert.deepEqual(res, {
        baz: {},
      }, "result");
    });
  });

  describe("parse schema content", () => {
    it("should get object", () => {
      const schema = new Schema();
      const res = schema._parseSchemaContent();
      assert.isObject(res, "result");
      const items = Object.entries(res);
      for (const [key, value] of items) {
        assert.isTrue(key.endsWith(".json"), `${key}`);
        assert.isArray(value, `${key} value`);
      }
    });

    it("should get object", () => {
      const schema = new Schema("beta");
      const res = schema._parseSchemaContent();
      assert.isObject(res, "result");
      const items = Object.entries(res);
      for (const [key, value] of items) {
        assert.isTrue(key.endsWith(".json"), `${key}`);
        assert.isArray(value, `${key} value`);
      }
    });

    it("should get object", () => {
      const schema = new Schema("central");
      const res = schema._parseSchemaContent();
      assert.isObject(res, "result");
      const items = Object.entries(res);
      for (const [key, value] of items) {
        assert.isTrue(key.endsWith(".json"), `${key}`);
        assert.isArray(value, `${key} value`);
      }
    });

    it("should get object", () => {
      const schema = new Schema("release");
      const res = schema._parseSchemaContent();
      assert.isObject(res, "result");
      const items = Object.entries(res);
      for (const [key, value] of items) {
        assert.isTrue(key.endsWith(".json"), `${key}`);
        assert.isArray(value, `${key} value`);
      }
    });

    it("should get object", () => {
      const schema = new Schema("mail");
      const res = schema._parseSchemaContent();
      assert.isObject(res, "result");
      const items = Object.entries(res);
      for (const [key, value] of items) {
        assert.isTrue(key.endsWith(".json"), `${key}`);
        assert.isArray(value, `${key} value`);
      }
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

    it("should get array", () => {
      const schema = new Schema("release");
      const res = schema.list();
      assert.isArray(res, "result");
      for (const key of res) {
        assert.isTrue(key.endsWith(".json"), "key");
      }
    });
  });

  describe("mock browser api", () => {
    it("should get stubbed api", () => {
      const schema = new Schema();
      const browser = schema.mock();
      assert.isObject(browser, "browser");
      const {
        bookmarks, browserAction, browserSettings, commands, contextMenus,
        contextualIdentities, devtools: {inspectedWindow}, i18n, management,
        menus, notifications, permissions, privacy, runtime, sessions, storage,
        tabs, theme, windows,
      } = browser;
      assert.isObject(bookmarks, "bookmarks");
      assert.isFunction(bookmarks.create, "bookmarks.create");
      assert.isNumber(bookmarks.create.callCount, "stub bookmarks.create");
      assert.isObject(browserAction, "browserAction");
      assert.isFunction(browserAction.setTitle, "browserAction.setTitle");
      assert.isNumber(browserAction.setTitle.callCount,
                      "stub browserAction.setTitle");
      assert.isObject(browserAction.onClicked, "browserAction.onClicked");
      assert.isFunction(browserAction.onClicked.addListener,
                        "browserAction.onClicked.addListener");
      assert.isNumber(browserAction.onClicked.addListener.callCount,
                      "stub browserAction.onClicked.addListener.callCount");
      assert.isObject(browserSettings, "browserSettings");
      assert.isObject(browserSettings.closeTabsByDoubleClick,
                      "browserSettings.closeTabsByDoubleClick");
      assert.isObject(commands, "commands");
      assert.isFunction(commands.update, "commands.update");
      assert.isNumber(commands.update.callCount,
                      "stub commands.update.setTitle");
      assert.isObject(contextMenus, "contextMenus");
      assert.isFunction(contextMenus.create, "contextMenus.create");
      assert.isNumber(contextMenus.create.callCount,
                      "stub contextMenus.create.setTitle");
      assert.isObject(contextualIdentities, "contextualIdentities");
      assert.isFunction(contextualIdentities.get, "contextualIdentities.get");
      assert.isNumber(contextualIdentities.get.callCount,
                      "stub contextualIdentities.get.setTitle");
      assert.isObject(inspectedWindow, "inspectedWindow");
      assert.isFunction(inspectedWindow.reload, "inspectedWindow.reload");
      assert.isNumber(inspectedWindow.reload.callCount,
                      "stub inspectedWindow.reload.setTitle");
      assert.isObject(i18n, "i18n");
      assert.isFunction(i18n.getMessage, "i18n.getMessage");
      assert.isNumber(i18n.getMessage.callCount, "stub i18n.getMessage");
      assert.isObject(management, "management");
      assert.isFunction(management.get, "management.get");
      assert.isNumber(management.get.callCount, "stub management.get");
      assert.isObject(menus, "menus");
      assert.isFunction(menus.create, "menus.create");
      assert.isNumber(menus.create.callCount, "stub menus.create");
      assert.isFunction(menus.getTargetElement, "menus.getTargetElement");
      assert.isNumber(menus.getTargetElement.callCount,
                      "stub menus.getTargetElement");
      assert.isFunction(menus.removeAll, "menus.removeAll");
      assert.isNumber(menus.removeAll.callCount, "stub menus.removeAll");
      assert.isObject(notifications, "notifications");
      assert.isFunction(notifications.create, "notifications.create");
      assert.isNumber(notifications.create.callCount,
                      "stub notifications.create");
      assert.isObject(notifications.onClosed, "notifications.onClosed");
      assert.isFunction(notifications.onClosed.addListener,
                        "notifications.onClosed.addListener");
      assert.isNumber(notifications.onClosed.addListener.callCount,
                      "stub notifications.onClosed.addListener");
      assert.isObject(permissions, "permissions");
      assert.isFunction(permissions.request, "permissions.request");
      assert.isNumber(permissions.request.callCount,
                      "stub permissions.request");
      assert.isObject(privacy.network.tlsVersionRestrictionConfig,
                      "privacy.network.tlsVersionRestrictionConfig");
      assert.isObject(runtime, "runtime");
      assert.isFunction(runtime.connect, "runtime.connect");
      assert.isNumber(runtime.connect.callCount, "stub runtime.connect");
      assert.isObject(runtime.Port, "runtime.Port");
      assert.isFunction(runtime.Port.disconnect, "runtime.Port.disconnect");
      assert.isFunction(runtime.Port.onDisconnect.addListener,
                        "runtime.Port.disconnect");
      assert.isFunction(runtime.Port.onDisconnect.addListener,
                        "runtime.Port.onDisconnect.addListener");
      assert.isObject(sessions, "sessions");
      assert.isFunction(sessions.getRecentlyClosed,
                        "sessions.getRecentlyClosed");
      assert.isNumber(sessions.getRecentlyClosed.callCount,
                      "stub sessions.getRecentlyClosed");
      assert.isObject(storage, "storage");
      assert.isObject(storage.local, "storage.local");
      assert.isFunction(storage.local.get, "storage.local.get");
      assert.isNumber(storage.local.get.callCount, "stub storage.local.get");
      assert.isObject(storage.onChanged, "storage.onChanged");
      assert.isFunction(storage.onChanged.addListener,
                        "storage.onChanged.addListener");
      assert.isNumber(storage.onChanged.addListener.callCount,
                      "stub storage.onChanged.addListener");
      assert.isObject(tabs, "tabs");
      assert.isFunction(tabs.get, "tabs.get");
      assert.isNumber(tabs.get.callCount, "stub tabs.get");
      assert.isObject(theme, "theme");
      assert.isFunction(theme.getCurrent, "theme.getCurrent");
      assert.isNumber(theme.getCurrent.callCount, "stub theme.getCurrent");
      assert.isObject(windows, "windows");
      assert.isFunction(windows.get, "windows.get");
      assert.isNumber(windows.get.callCount, "stub windows.get");
    });

    it("should access sandbox", () => {
      const browser = new Schema().mock();
      assert.isObject(browser._sandbox, "sandbox");
      assert.isFunction(browser._sandbox.stub, "stub");
      const i = browser.runtime.connect.callCount;
      browser.runtime.connect();
      assert.strictEqual(browser.runtime.connect.callCount, i + 1, "called");
      browser._sandbox.reset();
      assert.strictEqual(browser.runtime.connect.callCount, 0, "reset");
    });

    it("mock runtime.connect", () => {
      const browser = new Schema().mock();
      const mockConnect = browser.runtime.connect.callsFake(({name}) => {
        const port = Object.assign({}, browser.runtime.Port);
        port.name = name;
        return port;
      });

      const port1 = mockConnect({name: "foo"});
      const port2 = mockConnect({name: "bar"});
      assert.strictEqual(port1.name, "foo", "name");
      assert.strictEqual(port2.name, "bar", "name");
      assert.isFunction(port1.onDisconnect.addListener, "function");
      assert.isFunction(port2.onDisconnect.addListener, "function");

      // reset
      mockConnect.reset();
    });
  });
});
