/* api */
import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';

/* test */
import { Schema } from '../modules/schema.js';

describe('Schema', () => {
  describe('construct', () => {
    it('should be instance of Schema', () => {
      const schema = new Schema();
      assert.strictEqual(schema instanceof Schema, true, 'instance');
      assert.strictEqual(schema.channel, 'beta', 'channel');
      assert.strictEqual(typeof schema._sandbox, 'object', 'sandbox');
      schema._sandbox.restore();
    });

    it('should be instance of Schema', () => {
      const schema = new Schema('central');
      assert.strictEqual(schema instanceof Schema, true, 'instance');
      assert.strictEqual(schema.channel, 'central', 'channel');
      assert.strictEqual(typeof schema._sandbox, 'object', 'sandbox');
      schema._sandbox.restore();
    });

    it('should be instance of Schema', () => {
      const config = {
        injectInto: null,
        properties: ['spy', 'stub', 'mock'],
        useFakeTimers: true,
        useFakeServer: true
      };
      const schema = new Schema(config);
      assert.strictEqual(schema instanceof Schema, true, 'instance');
      assert.strictEqual(schema.channel, 'beta', 'channel');
      assert.strictEqual(typeof schema._sandbox, 'object', 'sandbox');
      schema._sandbox.restore();
    });

    it('should be instance of Schema', () => {
      const config = {
        injectInto: null,
        properties: ['spy', 'stub', 'mock'],
        useFakeTimers: true,
        useFakeServer: true
      };
      const schema = new Schema('central', config);
      assert.strictEqual(schema instanceof Schema, true, 'instance');
      assert.strictEqual(schema.channel, 'central', 'channel');
      assert.strictEqual(typeof schema._sandbox, 'object', 'sandbox');
      schema._sandbox.restore();
    });
  });

  describe('getter', () => {
    it('should get default value', () => {
      const schema = new Schema();
      assert.strictEqual(schema.channel, 'beta');
    });

    it('should get default value', () => {
      const schema = new Schema('foo');
      assert.strictEqual(schema.channel, 'beta');
    });

    it('should get value', () => {
      const schema = new Schema('beta');
      assert.strictEqual(schema.channel, 'beta');
    });

    it('should get value', () => {
      const schema = new Schema('central');
      assert.strictEqual(schema.channel, 'central');
    });

    it('should get value', () => {
      const schema = new Schema('esr');
      assert.strictEqual(schema.channel, 'esr');
    });

    it('should get value', () => {
      const schema = new Schema('release');
      assert.strictEqual(schema.channel, 'release');
    });

    it('should get value', () => {
      const schema = new Schema('mail');
      assert.strictEqual(schema.channel, 'mail');
    });
  });

  describe('setter', () => {
    it('should set default value', () => {
      const schema = new Schema();
      schema.channel = 1;
      assert.strictEqual(schema.channel, 'beta');
    });

    it('should set default value', () => {
      const schema = new Schema();
      schema.channel = 'foo';
      assert.strictEqual(schema.channel, 'beta');
    });

    it('should set value', () => {
      const schema = new Schema();
      schema.channel = 'central';
      assert.strictEqual(schema.channel, 'central');
    });

    it('should set value', () => {
      const schema = new Schema();
      schema.channel = 'esr';
      assert.strictEqual(schema.channel, 'esr');
    });

    it('should set value', () => {
      const schema = new Schema();
      schema.channel = 'release';
      assert.strictEqual(schema.channel, 'release');
    });

    it('should set value', () => {
      const schema = new Schema();
      schema.channel = 'mail';
      assert.strictEqual(schema.channel, 'mail');
    });

    it('should set value', () => {
      const schema = new Schema('central');
      schema.channel = 'beta';
      assert.strictEqual(schema.channel, 'beta');
    });

    it('should set value', () => {
      const schema = new Schema('central');
      schema.channel = 'release';
      assert.strictEqual(schema.channel, 'release');
    });

    it('should set value', () => {
      const schema = new Schema('central');
      schema.channel = 'esr';
      assert.strictEqual(schema.channel, 'esr');
    });

    it('should set value', () => {
      const schema = new Schema('mail');
      schema.channel = 'release';
      assert.strictEqual(schema.channel, 'release');
    });
  });

  describe('get target from namespace', () => {
    it('should get null', () => {
      const schema = new Schema();
      schema._browser = {};
      const res = schema._getTargetFromNamespace();
      assert.deepEqual(res, null, 'result');
    });

    it('should get null', () => {
      const schema = new Schema();
      schema._browser = {};
      const res = schema._getTargetFromNamespace('');
      assert.deepEqual(res, null, 'result');
    });

    it('should get null', () => {
      const schema = new Schema();
      schema._browser = {};
      const res = schema._getTargetFromNamespace('foo');
      assert.deepEqual(res, null, 'result');
    });

    it('should get target object', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {}
      };
      const res = schema._getTargetFromNamespace('foo');
      assert.deepEqual(res, schema._browser.foo, 'result');
    });

    it('should get null', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          bar: {}
        }
      };
      const res = schema._getTargetFromNamespace('foo.baz');
      assert.deepEqual(res, null, 'result');
    });

    it('should get target object', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          bar: {}
        }
      };
      const res = schema._getTargetFromNamespace('foo.bar');
      assert.deepEqual(res, schema._browser.foo.bar, 'result');
    });

    it('should get target object', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          bar: {
            baz: {}
          }
        }
      };
      const res = schema._getTargetFromNamespace('foo.bar.baz');
      assert.deepEqual(res, schema._browser.foo.bar.baz, 'result');
    });
  });

  describe('assign import map', () => {
    it('should not assign', () => {
      const schema = new Schema();
      schema._browser = {};
      schema._assignImportMap();
      assert.deepEqual(schema._browser, {}, 'browser');
      assert.strictEqual(schema._importMap.size, 0, 'size');
    });

    it('should not assign', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {}
        },
        bar: {}
      };
      schema._importMap.set('qux', {
        $import: 'baz',
        namespace: 'foo'
      });
      schema._assignImportMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {}
        },
        bar: {
        }
      }, 'browser');
      assert.strictEqual(schema._importMap.size, 0, 'size');
    });

    it('should assign', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {}
        },
        bar: {}
      };
      schema._importMap.set('bar', {
        $import: 'foo',
        namespace: 'bar'
      });
      schema._assignImportMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {}
        },
        bar: {
          baz: {}
        }
      }, 'browser');
      assert.strictEqual(schema._importMap.size, 0, 'size');
    });

    it('should assign', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {
            qux: {}
          }
        },
        bar: {}
      };
      schema._importMap.set('bar', {
        $import: 'foo.baz',
        namespace: 'bar'
      });
      schema._assignImportMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {
            qux: {}
          }
        },
        bar: {
          qux: {}
        }
      }, 'browser');
      assert.strictEqual(schema._importMap.size, 0, 'size');
    });

    it('should assign', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {
            qux: {}
          }
        },
        bar: {
          quux: {}
        }
      };
      schema._importMap.set('bar.quux', {
        $import: 'foo.baz',
        namespace: 'bar'
      });
      schema._assignImportMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {
            qux: {}
          }
        },
        bar: {
          quux: {
            qux: {}
          }
        }
      }, 'browser');
      assert.strictEqual(schema._importMap.size, 0, 'size');
    });

    it('should assign', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          bar: {},
          baz: {
            qux: {}
          }
        }
      };
      schema._importMap.set('foo.bar', {
        $import: 'baz',
        namespace: 'foo'
      });
      schema._assignImportMap();
      assert.deepEqual(schema._browser, {
        foo: {
          bar: {
            qux: {}
          },
          baz: {
            qux: {}
          }
        }
      }, 'browser');
      assert.strictEqual(schema._importMap.size, 0, 'size');
    });
  });

  describe('assign referred map', () => {
    it('should not assign', () => {
      const schema = new Schema();
      schema._browser = {};
      schema._assignRefMap();
      assert.deepEqual(schema._browser, {}, 'browser');
      assert.strictEqual(schema._refMap.size, 0, 'size');
    });

    it('should not assign', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {}
        },
        bar: {}
      };
      schema._refMap.set('qux', {
        $ref: 'baz',
        namespace: 'foo'
      });
      schema._assignRefMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {}
        },
        bar: {
        }
      }, 'browser');
      assert.strictEqual(schema._refMap.size, 0, 'size');
    });

    it('should assign', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {}
        },
        bar: {}
      };
      schema._refMap.set('bar', {
        $ref: 'foo',
        namespace: 'bar'
      });
      schema._assignRefMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {}
        },
        bar: {
          baz: {}
        }
      }, 'browser');
      assert.strictEqual(schema._refMap.size, 0, 'size');
    });

    it('should assign', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {
            qux: {}
          }
        },
        bar: {}
      };
      schema._refMap.set('bar', {
        $ref: 'foo.baz',
        namespace: 'bar'
      });
      schema._assignRefMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {
            qux: {}
          }
        },
        bar: {
          qux: {}
        }
      }, 'browser');
      assert.strictEqual(schema._refMap.size, 0, 'size');
    });

    it('should assign', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          baz: {
            qux: {}
          }
        },
        bar: {
          quux: {}
        }
      };
      schema._refMap.set('bar.quux', {
        $ref: 'foo.baz',
        namespace: 'bar'
      });
      schema._assignRefMap();
      assert.deepEqual(schema._browser, {
        foo: {
          baz: {
            qux: {}
          }
        },
        bar: {
          quux: {
            qux: {}
          }
        }
      }, 'browser');
      assert.strictEqual(schema._refMap.size, 0, 'size');
    });

    it('should assign', () => {
      const schema = new Schema();
      schema._browser = {
        foo: {
          bar: {},
          baz: {
            qux: {}
          }
        }
      };
      schema._refMap.set('foo.bar', {
        $ref: 'baz',
        namespace: 'foo'
      });
      schema._assignRefMap();
      assert.deepEqual(schema._browser, {
        foo: {
          bar: {
            qux: {}
          },
          baz: {
            qux: {}
          }
        }
      }, 'browser');
      assert.strictEqual(schema._refMap.size, 0, 'size');
    });
  });

  describe('mock events', () => {
    it('should throw', () => {
      const schema = new Schema();
      assert.throws(() => schema._mockEvents());
    });

    it('should throw', () => {
      const schema = new Schema();
      assert.throws(() => schema._mockEvents({}));
    });

    it('should not add listeners', () => {
      const schema = new Schema();
      const res = schema._mockEvents({}, []);
      assert.deepEqual(res, {}, 'result');
    });

    it('should not add listeners', () => {
      const schema = new Schema();
      const res = schema._mockEvents({}, [
        {
          name: 'foo',
          type: 'function',
          unsupported: true
        }
      ]);
      assert.deepEqual(res, {}, 'result');
    });

    it('should not add listeners', () => {
      const schema = new Schema();
      const res = schema._mockEvents({}, [
        {
          name: 'foo',
          type: 'object'
        }
      ]);
      assert.deepEqual(res, {}, 'result');
    });

    it('should add listeners', () => {
      const schema = new Schema();
      const res = schema._mockEvents({}, [
        {
          name: 'foo',
          type: 'function'
        }
      ]);
      assert.strictEqual(typeof res, 'object', 'result');
      assert.strictEqual(typeof res.foo, 'object', 'result');
      assert.strictEqual(typeof res.foo.addListener, 'function', 'addListener');
      assert.strictEqual(typeof res.foo.hasListener, 'function', 'hasListener');
      assert.strictEqual(typeof res.foo.removeListener, 'function',
        'removeListener');
    });

    it('should add listeners', () => {
      const schema = new Schema();
      const res = schema._mockEvents({
        foo: {}
      }, [
        {
          name: 'foo',
          type: 'function'
        }
      ]);
      assert.strictEqual(typeof res, 'object', 'result');
      assert.strictEqual(typeof res.foo, 'object', 'result');
      assert.strictEqual(typeof res.foo.addListener, 'function', 'addListener');
      assert.strictEqual(typeof res.foo.hasListener, 'function', 'hasListener');
      assert.strictEqual(typeof res.foo.removeListener, 'function',
        'removeListener');
    });
  });

  describe('mock functions', () => {
    it('should throw', () => {
      const schema = new Schema();
      assert.throws(() => schema._mockFunctions());
    });

    it('should throw', () => {
      const schema = new Schema();
      assert.throws(() => schema._mockFunctions({}));
    });

    it('should not add functions', () => {
      const schema = new Schema();
      const res = schema._mockFunctions({}, []);
      assert.deepEqual(res, {}, 'result');
    });

    it('should not add functions', () => {
      const schema = new Schema();
      const res = schema._mockFunctions({}, [
        {
          name: 'foo',
          type: 'function',
          unsupported: true
        }
      ]);
      assert.deepEqual(res, {}, 'result');
    });

    it('should not add functions', () => {
      const schema = new Schema();
      const res = schema._mockFunctions({}, [
        {
          name: 'foo',
          type: 'object'
        }
      ]);
      assert.deepEqual(res, {}, 'result');
    });

    it('should add functions', () => {
      const schema = new Schema();
      const res = schema._mockFunctions({}, [
        {
          name: 'foo',
          type: 'function'
        }
      ]);
      assert.strictEqual(typeof res, 'object', 'result');
      assert.strictEqual(typeof res.foo, 'function', 'function');
    });

    it('should add functions', () => {
      const schema = new Schema();
      const res = schema._mockFunctions({
        foo: {}
      }, [
        {
          name: 'foo',
          type: 'function'
        }
      ]);
      assert.strictEqual(typeof res, 'object', 'result');
      assert.strictEqual(typeof res.foo, 'function', 'function');
    });
  });

  describe('mock properties', () => {
    it('should throw', () => {
      const schema = new Schema();
      assert.throws(() => schema._mockProperties());
    });

    it('should throw', () => {
      const schema = new Schema();
      assert.throws(() => schema._mockProperties({}));
    });

    it('should throw', () => {
      const schema = new Schema();
      assert.throws(() => schema._mockProperties({}, {}));
    });

    it('should not add properties', () => {
      const schema = new Schema();
      const res = schema._mockProperties({}, {}, 'foo');
      assert.deepEqual(res, {}, 'result');
    });

    it('should not add properties', () => {
      const schema = new Schema();
      const res = schema._mockProperties({}, {
        bar: {
          name: 'baz',
          type: 'function',
          unsupported: true
        }
      }, 'foo');
      assert.deepEqual(res, {}, 'result');
    });

    it('should set map', () => {
      const schema = new Schema();
      const res = schema._mockProperties({
      }, {
        bar: {
          $ref: 'baz'
        }
      }, 'foo');
      assert.deepEqual(res, {
        bar: {}
      }, 'result');
      assert.deepEqual(Array.from(schema._refMap), [
        [
          'foo.bar',
          {
            $ref: 'baz',
            namespace: 'foo'
          }
        ]
      ], 'map');
    });

    it('should add properties', () => {
      const schema = new Schema();
      const res = schema._mockProperties({
      }, {
        bar: {
          value: -1
        }
      }, 'foo');
      assert.deepEqual(res, {
        bar: -1
      }, 'result');
    });

    it('should add properties', () => {
      const schema = new Schema();
      const res = schema._mockProperties({
      }, {
        bar: {
          type: 'function'
        }
      }, 'foo');
      assert.strictEqual(typeof res, 'object', 'result');
      assert.strictEqual(typeof res.bar, 'function', 'property');
    });

    it('should add properties', () => {
      const schema = new Schema();
      const res = schema._mockProperties({
      }, {
        bar: {
          type: 'object'
        }
      }, 'foo');
      assert.deepEqual(res, {
        bar: {}
      }, 'result');
    });

    it('should add properties', () => {
      const schema = new Schema();
      const res = schema._mockProperties({
        bar: {}
      }, {
        bar: {
          properties: {
            baz: {
              type: 'object'
            }
          }
        }
      }, 'foo');
      assert.deepEqual(res, {
        bar: {
          baz: {}
        }
      }, 'result');
    });

    it('should add properties', () => {
      const schema = new Schema();
      const res = schema._mockProperties({
      }, {
        bar: {
          type: 'string'
        }
      }, 'foo');
      assert.deepEqual(res, {
        bar: null
      }, 'result');
    });
  });

  describe('mock types', () => {
    it('should throw', () => {
      const schema = new Schema();
      assert.throws(() => schema._mockTypes());
    });

    it('should throw', () => {
      const schema = new Schema();
      assert.throws(() => schema._mockTypes({}));
    });

    it('should throw', () => {
      const schema = new Schema();
      assert.throws(() => schema._mockTypes({}, []));
    });

    it('should not add types', () => {
      const schema = new Schema();
      const res = schema._mockTypes({}, [{}], 'foo');
      assert.deepEqual(res, {}, 'result');
    });

    it('should set map', () => {
      const schema = new Schema();
      const res = schema._mockTypes({
      }, [
        {
          $import: 'bar',
          id: 'baz'
        }
      ], 'foo');
      assert.deepEqual(res, {
        baz: {}
      }, 'result');
      assert.deepEqual(Array.from(schema._importMap), [
        [
          'foo.baz',
          {
            $import: 'bar',
            namespace: 'foo'
          }
        ]
      ], 'map');
    });

    it('should add types', () => {
      const schema = new Schema();
      const res = schema._mockTypes({
      }, [
        {
          id: 'baz',
          type: 'object'
        }
      ], 'foo');
      assert.deepEqual(res, {
        baz: {}
      }, 'result');
    });

    it('should add types', () => {
      const schema = new Schema();
      const res = schema._mockTypes({
        baz: {}
      }, [
        {
          events: [],
          functions: [],
          id: 'baz',
          properties: {},
          type: 'object'
        }
      ], 'foo');
      assert.deepEqual(res, {
        baz: {}
      }, 'result');
    });
  });

  describe('parse schema content', () => {
    it('should get object', () => {
      const schema = new Schema();
      const res = schema._parseSchemaContent();
      assert.deepEqual(res, schema._schema, 'schema');
      const items = Object.entries(res);
      for (const [key, value] of items) {
        assert.strictEqual(key.endsWith('.json'), true, `${key}`);
        assert.strictEqual(Array.isArray(value), true, `${key} value`);
      }
    });

    it('should get object', () => {
      const schema = new Schema('beta');
      const res = schema._parseSchemaContent();
      assert.deepEqual(res, schema._schema, 'schema');
      const items = Object.entries(res);
      for (const [key, value] of items) {
        assert.strictEqual(key.endsWith('.json'), true, `${key}`);
        assert.strictEqual(Array.isArray(value), true, `${key} value`);
      }
    });

    it('should get object', () => {
      const schema = new Schema('central');
      const res = schema._parseSchemaContent();
      assert.deepEqual(res, schema._schema, 'schema');
      const items = Object.entries(res);
      for (const [key, value] of items) {
        assert.strictEqual(key.endsWith('.json'), true, `${key}`);
        assert.strictEqual(Array.isArray(value), true, `${key} value`);
      }
    });

    it('should get object', () => {
      const schema = new Schema('esr');
      const res = schema._parseSchemaContent();
      assert.deepEqual(res, schema._schema, 'schema');
      const items = Object.entries(res);
      for (const [key, value] of items) {
        assert.strictEqual(key.endsWith('.json'), true, `${key}`);
        assert.strictEqual(Array.isArray(value), true, `${key} value`);
      }
    });

    it('should get object', () => {
      const schema = new Schema('release');
      const res = schema._parseSchemaContent();
      assert.deepEqual(res, schema._schema, 'schema');
      const items = Object.entries(res);
      for (const [key, value] of items) {
        assert.strictEqual(key.endsWith('.json'), true, `${key}`);
        assert.strictEqual(Array.isArray(value), true, `${key} value`);
      }
    });

    it('should get object', () => {
      const schema = new Schema('mail');
      const res = schema._parseSchemaContent();
      assert.deepEqual(res, schema._schema, 'schema');
      const items = Object.entries(res);
      for (const [key, value] of items) {
        assert.strictEqual(key.endsWith('.json'), true, `${key}`);
        assert.strictEqual(Array.isArray(value), true, `${key} value`);
      }
    });
  });

  describe('get schema', () => {
    it('should throw', () => {
      const schema = new Schema();
      assert.throws(() => schema.get(), TypeError,
        'Expected String but got Undefined.');
    });

    it('should get null', () => {
      const schema = new Schema();
      const res = schema.get('foo');
      assert.deepEqual(res, null, 'result');
    });

    it('should get array', () => {
      const schema = new Schema();
      const res = schema.get('browser_action.json');
      assert.strictEqual(Array.isArray(res), true, 'result');
    });

    it('should get array', () => {
      const schema = new Schema();
      schema._parseSchemaContent();
      const res = schema.get('browser_action.json');
      assert.strictEqual(Array.isArray(res), true, 'result');
    });

    it('should get array', () => {
      const schema = new Schema();
      const res = schema.get('browser_action');
      assert.strictEqual(Array.isArray(res), true, 'result');
    });

    it('should get array', () => {
      const schema = new Schema();
      const res = schema.get('browserAction');
      assert.strictEqual(Array.isArray(res), true, 'result');
    });
  });

  describe('get all schemas', () => {
    it('should get object', () => {
      const schema = new Schema();
      schema._parseSchemaContent();
      assert.strictEqual(typeof schema._schema, 'object', 'schema');
      const res = schema.getAll();
      assert.strictEqual(typeof res, 'object', 'result');
      const keys = Object.keys(res);
      for (const key of keys) {
        assert.strictEqual(key.endsWith('.json'), true, 'key');
      }
    });

    it('should get object', () => {
      const schema = new Schema();
      const res = schema.getAll();
      assert.strictEqual(typeof res, 'object', 'result');
      const keys = Object.keys(res);
      for (const key of keys) {
        assert.strictEqual(key.endsWith('.json'), true, 'key');
      }
    });
  });

  describe('list schemas', () => {
    it('should get array', () => {
      const schema = new Schema();
      schema._parseSchemaContent();
      assert.strictEqual(typeof schema._schema, 'object', 'schema');
      const res = schema.list();
      assert.strictEqual(Array.isArray(res), true, 'result');
      for (const key of res) {
        assert.strictEqual(key.endsWith('.json'), true, 'key');
      }
    });

    it('should get array', () => {
      const schema = new Schema();
      const res = schema.list();
      assert.strictEqual(Array.isArray(res), true, 'result');
      for (const key of res) {
        assert.strictEqual(key.endsWith('.json'), true, 'key');
      }
    });

    it('should get array', () => {
      const schema = new Schema('beta');
      const res = schema.list();
      assert.strictEqual(Array.isArray(res), true, 'result');
      for (const key of res) {
        assert.strictEqual(key.endsWith('.json'), true, 'key');
      }
    });

    it('should get array', () => {
      const schema = new Schema('central');
      const res = schema.list();
      assert.strictEqual(Array.isArray(res), true, 'result');
      for (const key of res) {
        assert.strictEqual(key.endsWith('.json'), true, 'key');
      }
    });

    it('should get array', () => {
      const schema = new Schema('esr');
      const res = schema.list();
      assert.strictEqual(Array.isArray(res), true, 'result');
      for (const key of res) {
        assert.strictEqual(key.endsWith('.json'), true, 'key');
      }
    });

    it('should get array', () => {
      const schema = new Schema('release');
      const res = schema.list();
      assert.strictEqual(Array.isArray(res), true, 'result');
      for (const key of res) {
        assert.strictEqual(key.endsWith('.json'), true, 'key');
      }
    });
  });

  describe('mock browser api', () => {
    it('should get stubbed api', () => {
      const schema = new Schema();
      schema._parseSchemaContent();
      assert.strictEqual(typeof schema._schema, 'object', 'schema');
      const browser = schema.mock();
      assert.strictEqual(typeof browser, 'object', 'browser');
      const {
        bookmarks, browserAction, browserSettings, commands, contextMenus,
        contextualIdentities, devtools, i18n, management, menus, notifications,
        permissions, privacy, runtime, sessions, storage, tabs, theme, windows
      } = browser;
      const { inspectedWindow } = devtools;
      assert.strictEqual(typeof bookmarks, 'object', 'bookmarks');
      assert.strictEqual(typeof bookmarks.create, 'function',
        'bookmarks.create');
      assert.strictEqual(typeof bookmarks.create.callCount, 'number',
        'stub bookmarks.create');
      assert.strictEqual(typeof browserAction, 'object', 'browserAction');
      assert.strictEqual(typeof browserAction.setTitle, 'function',
        'browserAction.setTitle');
      assert.strictEqual(typeof browserAction.setTitle.callCount, 'number',
        'stub browserAction.setTitle');
      assert.strictEqual(typeof browserAction.onClicked, 'object',
        'browserAction.onClicked');
      assert.strictEqual(typeof browserAction.onClicked.addListener, 'function',
        'browserAction.onClicked.addListener');
      assert.strictEqual(typeof browserAction.onClicked.addListener.callCount,
        'number', 'stub browserAction.onClicked.addListener.callCount');
      assert.strictEqual(typeof browserSettings, 'object', 'browserSettings');
      assert.strictEqual(typeof browserSettings.closeTabsByDoubleClick,
        'object', 'browserSettings.closeTabsByDoubleClick');
      assert.strictEqual(typeof commands, 'object', 'commands');
      assert.strictEqual(typeof commands.update, 'function',
        'commands.update');
      assert.strictEqual(typeof commands.update.callCount, 'number',
        'stub commands.update');
      assert.strictEqual(typeof contextMenus, 'object', 'contextMenus');
      assert.strictEqual(typeof contextMenus.create, 'function',
        'contextMenus.create');
      assert.strictEqual(typeof contextMenus.create.callCount, 'number',
        'stub contextMenus.create');
      assert.strictEqual(typeof contextualIdentities, 'object',
        'contextualIdentities');
      assert.strictEqual(typeof contextualIdentities.get, 'function',
        'contextualIdentities.get');
      assert.strictEqual(typeof contextualIdentities.get.callCount, 'number',
        'stub contextualIdentities.get');
      assert.strictEqual(typeof devtools, 'object', 'devtools');
      assert.strictEqual(typeof inspectedWindow, 'object', 'inspectedWindow');
      assert.strictEqual(typeof inspectedWindow.reload, 'function',
        'inspectedWindow.reload');
      assert.strictEqual(typeof inspectedWindow.reload.callCount, 'number',
        'stub inspectedWindow.reload');
      assert.strictEqual(typeof i18n, 'object', 'i18n');
      assert.strictEqual(typeof i18n.getMessage, 'function',
        'i18n.getMessage');
      assert.strictEqual(typeof i18n.getMessage.callCount, 'number',
        'stub i18n.getMessage');
      assert.strictEqual(typeof management, 'object', 'management');
      assert.strictEqual(typeof management.get, 'function',
        'management.get');
      assert.strictEqual(typeof management.get.callCount, 'number',
        'stub management.get');
      assert.strictEqual(typeof menus, 'object', 'menus');
      assert.strictEqual(typeof menus.create, 'function',
        'menus.create');
      assert.strictEqual(typeof menus.create.callCount, 'number',
        'stub menus.create');
      assert.strictEqual(typeof menus.getTargetElement, 'function',
        'menus.getTargetElement');
      assert.strictEqual(typeof menus.getTargetElement.callCount, 'number',
        'stub menus.getTargetElement');
      assert.strictEqual(typeof menus.removeAll, 'function',
        'menus.removeAll');
      assert.strictEqual(typeof menus.removeAll.callCount, 'number',
        'stub menus.removeAll');
      assert.strictEqual(typeof notifications, 'object', 'notifications');
      assert.strictEqual(typeof notifications.create, 'function',
        'notifications.create');
      assert.strictEqual(typeof notifications.create.callCount, 'number',
        'stub notifications.create');
      assert.strictEqual(typeof notifications.onClosed, 'object',
        'notifications.onClosed');
      assert.strictEqual(typeof notifications.onClosed.addListener, 'function',
        'notifications.onClosed.addListener');
      assert.strictEqual(typeof notifications.onClosed.addListener.callCount,
        'number', 'stub notifications.onClosed.addListener');
      assert.strictEqual(typeof permissions, 'object', 'permissions');
      assert.strictEqual(typeof permissions.request, 'function',
        'permissions.request');
      assert.strictEqual(typeof permissions.request.callCount, 'number',
        'stub permissions.request');
      assert.strictEqual(typeof privacy.network.tlsVersionRestrictionConfig,
        'object', 'privacy.network.tlsVersionRestrictionConfig');
      assert.strictEqual(typeof runtime, 'object', 'runtime');
      assert.strictEqual(typeof runtime.connect, 'function',
        'runtime.connect');
      assert.strictEqual(typeof runtime.connect.callCount, 'number',
        'stub runtime.connect');
      assert.strictEqual(typeof runtime.Port, 'object', 'runtime.Port');
      assert.strictEqual(typeof runtime.Port.disconnect, 'function',
        'runtime.Port.disconnect');
      assert.strictEqual(typeof runtime.Port.onDisconnect.addListener,
        'function', 'runtime.Port.disconnect');
      assert.strictEqual(typeof runtime.Port.onDisconnect.addListener,
        'function', 'runtime.Port.onDisconnect.addListener');
      assert.strictEqual(typeof sessions, 'object', 'sessions');
      assert.strictEqual(typeof sessions.getRecentlyClosed, 'function',
        'sessions.getRecentlyClosed');
      assert.strictEqual(typeof sessions.getRecentlyClosed.callCount, 'number',
        'stub sessions.getRecentlyClosed');
      assert.strictEqual(typeof storage, 'object', 'storage');
      assert.strictEqual(typeof storage.local, 'object', 'storage.local');
      assert.strictEqual(typeof storage.local.get, 'function',
        'storage.local.get');
      assert.strictEqual(typeof storage.local.get.callCount, 'number',
        'stub storage.local.get');
      assert.strictEqual(typeof storage.onChanged, 'object',
        'storage.onChanged');
      assert.strictEqual(typeof storage.onChanged.addListener, 'function',
        'storage.onChanged.addListener');
      assert.strictEqual(typeof storage.onChanged.addListener.callCount,
        'number', 'stub storage.onChanged.addListener');
      assert.strictEqual(typeof tabs, 'object', 'tabs');
      assert.strictEqual(typeof tabs.get, 'function',
        'tabs.get');
      assert.strictEqual(typeof tabs.get.callCount, 'number',
        'stub tabs.get');
      assert.strictEqual(typeof theme, 'object', 'theme');
      assert.strictEqual(typeof theme.getCurrent, 'function',
        'theme.getCurrent');
      assert.strictEqual(typeof theme.getCurrent.callCount, 'number',
        'stub theme.getCurrent');
      assert.strictEqual(typeof windows, 'object', 'windows');
      assert.strictEqual(typeof windows.get, 'function',
        'windows.get');
      assert.strictEqual(typeof windows.get.callCount, 'number',
        'stub windows.get');
    });

    it('should get stubbed api', () => {
      const schema = new Schema();
      const browser = schema.mock();
      assert.strictEqual(typeof browser, 'object', 'browser');
      const {
        bookmarks, browserAction, browserSettings, commands, contextMenus,
        contextualIdentities, devtools, i18n, management, menus, notifications,
        permissions, privacy, runtime, sessions, storage, tabs, theme, windows
      } = browser;
      const { inspectedWindow } = devtools;
      assert.strictEqual(typeof bookmarks, 'object', 'bookmarks');
      assert.strictEqual(typeof bookmarks.create, 'function',
        'bookmarks.create');
      assert.strictEqual(typeof bookmarks.create.callCount, 'number',
        'stub bookmarks.create');
      assert.strictEqual(typeof browserAction, 'object', 'browserAction');
      assert.strictEqual(typeof browserAction.setTitle, 'function',
        'browserAction.setTitle');
      assert.strictEqual(typeof browserAction.setTitle.callCount, 'number',
        'stub browserAction.setTitle');
      assert.strictEqual(typeof browserAction.onClicked, 'object',
        'browserAction.onClicked');
      assert.strictEqual(typeof browserAction.onClicked.addListener, 'function',
        'browserAction.onClicked.addListener');
      assert.strictEqual(typeof browserAction.onClicked.addListener.callCount,
        'number', 'stub browserAction.onClicked.addListener.callCount');
      assert.strictEqual(typeof browserSettings, 'object', 'browserSettings');
      assert.strictEqual(typeof browserSettings.closeTabsByDoubleClick,
        'object', 'browserSettings.closeTabsByDoubleClick');
      assert.strictEqual(typeof commands, 'object', 'commands');
      assert.strictEqual(typeof commands.update, 'function',
        'commands.update');
      assert.strictEqual(typeof commands.update.callCount, 'number',
        'stub commands.update');
      assert.strictEqual(typeof contextMenus, 'object', 'contextMenus');
      assert.strictEqual(typeof contextMenus.create, 'function',
        'contextMenus.create');
      assert.strictEqual(typeof contextMenus.create.callCount, 'number',
        'stub contextMenus.create');
      assert.strictEqual(typeof contextualIdentities, 'object',
        'contextualIdentities');
      assert.strictEqual(typeof contextualIdentities.get, 'function',
        'contextualIdentities.get');
      assert.strictEqual(typeof contextualIdentities.get.callCount, 'number',
        'stub contextualIdentities.get');
      assert.strictEqual(typeof devtools, 'object', 'devtools');
      assert.strictEqual(typeof inspectedWindow, 'object', 'inspectedWindow');
      assert.strictEqual(typeof inspectedWindow.reload, 'function',
        'inspectedWindow.reload');
      assert.strictEqual(typeof inspectedWindow.reload.callCount, 'number',
        'stub inspectedWindow.reload');
      assert.strictEqual(typeof i18n, 'object', 'i18n');
      assert.strictEqual(typeof i18n.getMessage, 'function',
        'i18n.getMessage');
      assert.strictEqual(typeof i18n.getMessage.callCount, 'number',
        'stub i18n.getMessage');
      assert.strictEqual(typeof management, 'object', 'management');
      assert.strictEqual(typeof management.get, 'function',
        'management.get');
      assert.strictEqual(typeof management.get.callCount, 'number',
        'stub management.get');
      assert.strictEqual(typeof menus, 'object', 'menus');
      assert.strictEqual(typeof menus.create, 'function',
        'menus.create');
      assert.strictEqual(typeof menus.create.callCount, 'number',
        'stub menus.create');
      assert.strictEqual(typeof menus.getTargetElement, 'function',
        'menus.getTargetElement');
      assert.strictEqual(typeof menus.getTargetElement.callCount, 'number',
        'stub menus.getTargetElement');
      assert.strictEqual(typeof menus.removeAll, 'function',
        'menus.removeAll');
      assert.strictEqual(typeof menus.removeAll.callCount, 'number',
        'stub menus.removeAll');
      assert.strictEqual(typeof notifications, 'object', 'notifications');
      assert.strictEqual(typeof notifications.create, 'function',
        'notifications.create');
      assert.strictEqual(typeof notifications.create.callCount, 'number',
        'stub notifications.create');
      assert.strictEqual(typeof notifications.onClosed, 'object',
        'notifications.onClosed');
      assert.strictEqual(typeof notifications.onClosed.addListener, 'function',
        'notifications.onClosed.addListener');
      assert.strictEqual(typeof notifications.onClosed.addListener.callCount,
        'number', 'stub notifications.onClosed.addListener');
      assert.strictEqual(typeof permissions, 'object', 'permissions');
      assert.strictEqual(typeof permissions.request, 'function',
        'permissions.request');
      assert.strictEqual(typeof permissions.request.callCount, 'number',
        'stub permissions.request');
      assert.strictEqual(typeof privacy.network.tlsVersionRestrictionConfig,
        'object', 'privacy.network.tlsVersionRestrictionConfig');
      assert.strictEqual(typeof runtime, 'object', 'runtime');
      assert.strictEqual(typeof runtime.connect, 'function',
        'runtime.connect');
      assert.strictEqual(typeof runtime.connect.callCount, 'number',
        'stub runtime.connect');
      assert.strictEqual(typeof runtime.Port, 'object', 'runtime.Port');
      assert.strictEqual(typeof runtime.Port.disconnect, 'function',
        'runtime.Port.disconnect');
      assert.strictEqual(typeof runtime.Port.onDisconnect.addListener,
        'function', 'runtime.Port.disconnect');
      assert.strictEqual(typeof runtime.Port.onDisconnect.addListener,
        'function', 'runtime.Port.onDisconnect.addListener');
      assert.strictEqual(typeof sessions, 'object', 'sessions');
      assert.strictEqual(typeof sessions.getRecentlyClosed, 'function',
        'sessions.getRecentlyClosed');
      assert.strictEqual(typeof sessions.getRecentlyClosed.callCount, 'number',
        'stub sessions.getRecentlyClosed');
      assert.strictEqual(typeof storage, 'object', 'storage');
      assert.strictEqual(typeof storage.local, 'object', 'storage.local');
      assert.strictEqual(typeof storage.local.get, 'function',
        'storage.local.get');
      assert.strictEqual(typeof storage.local.get.callCount, 'number',
        'stub storage.local.get');
      assert.strictEqual(typeof storage.onChanged, 'object',
        'storage.onChanged');
      assert.strictEqual(typeof storage.onChanged.addListener, 'function',
        'storage.onChanged.addListener');
      assert.strictEqual(typeof storage.onChanged.addListener.callCount,
        'number', 'stub storage.onChanged.addListener');
      assert.strictEqual(typeof tabs, 'object', 'tabs');
      assert.strictEqual(typeof tabs.get, 'function',
        'tabs.get');
      assert.strictEqual(typeof tabs.get.callCount, 'number',
        'stub tabs.get');
      assert.strictEqual(typeof theme, 'object', 'theme');
      assert.strictEqual(typeof theme.getCurrent, 'function',
        'theme.getCurrent');
      assert.strictEqual(typeof theme.getCurrent.callCount, 'number',
        'stub theme.getCurrent');
      assert.strictEqual(typeof windows, 'object', 'windows');
      assert.strictEqual(typeof windows.get, 'function',
        'windows.get');
      assert.strictEqual(typeof windows.get.callCount, 'number',
        'stub windows.get');
    });

    it('should access sandbox', () => {
      const browser = new Schema().mock();
      assert.strictEqual(typeof browser._sandbox, 'object', 'sandbox');
      assert.strictEqual(typeof browser._sandbox.stub, 'function',
        'stub');
      const i = browser.runtime.connect.callCount;
      browser.runtime.connect();
      assert.strictEqual(browser.runtime.connect.callCount, i + 1, 'called');
      browser._sandbox.reset();
      assert.strictEqual(browser.runtime.connect.callCount, 0, 'reset');
    });

    it('mock runtime.connect', () => {
      const browser = new Schema().mock();
      const mockConnect = browser.runtime.connect.callsFake(({ name }) => {
        const port = Object.assign({}, browser.runtime.Port);
        port.name = name;
        return port;
      });

      const port1 = mockConnect({ name: 'foo' });
      const port2 = mockConnect({ name: 'bar' });
      assert.strictEqual(port1.name, 'foo', 'name');
      assert.strictEqual(port2.name, 'bar', 'name');
      assert.strictEqual(typeof port1.onDisconnect.addListener, 'function',
        'function');
      assert.strictEqual(typeof port2.onDisconnect.addListener, 'function',
        'function');

      // reset
      mockConnect.reset();
    });
  });
});
