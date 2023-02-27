/**
 * schema.js
 */

/* api */
import fs from 'node:fs';
import path from 'node:path';
import camelize from 'camelize';
import decamelize from 'decamelize';
import sinon from 'sinon';
import { getType, isObjectNotEmpty, isString } from './common.js';
import { convertUriToFilePath } from './file-util.js';
import { CHAR } from './constant.js';

export class Schema {
  /* private */
  #channel;

  /**
   * construct
   *
   * @param {...(string|object)} [args] - optional arguments
   *                                      {string} - release channel.
   *                                                 one of "beta", "central",
   *                                                 "release", "esr", "mail".
   *                                      {object} - sinon config
   */
  constructor(...args) {
    const [arg1, arg2] = args;
    this.#channel =
      isString(arg1) && /(?:centra|mai)l|beta|esr|release/.test(arg1)
        ? arg1
        : 'beta';
    this._sandbox =
      (isObjectNotEmpty(arg1) && sinon.createSandbox(arg1)) ||
      (isObjectNotEmpty(arg2) && sinon.createSandbox(arg2)) ||
      sinon.createSandbox();
    this._importMap = new Map();
    this._refMap = new Map();
    this._browser = null;
    this._schema = null;
  }

  /* getter / setter */
  get channel() {
    return this.#channel;
  }

  set channel(ch) {
    if (isString(ch) && /(?:centra|mai)l|beta|esr|release/.test(ch)) {
      this.#channel = ch;
    }
  }

  /**
   * get target from namespace key
   *
   * @param {string} key - namespace key
   * @returns {object} - target object
   */
  _getTargetFromNamespace(key) {
    let target;
    if (isString(key)) {
      const [...itemKeys] = key.split('.');
      let i = 0;
      const l = itemKeys.length;
      target = this._browser;
      while (i < l) {
        const itemKey = itemKeys[i];
        if (target[itemKey]) {
          target = target[itemKey];
        } else {
          target = null;
          break;
        }
        i++;
      }
    }
    return target || null;
  }

  /**
   * assign imported values
   *
   * @returns {void}
   */
  _assignImportMap() {
    if (this._importMap.size) {
      const items = [...this._importMap];
      for (const [key, value] of items) {
        const target = this._getTargetFromNamespace(key);
        if (target) {
          const { $import, namespace } = value;
          let importValue;
          if ($import.includes('.')) {
            importValue = this._getTargetFromNamespace($import);
          } else if (this._browser[$import]) {
            importValue = this._browser[$import];
          } else {
            importValue = this._browser[namespace]?.[$import];
          }
          Object.assign(target, importValue);
        }
      }
      this._importMap.clear();
    }
  }

  /**
   * assign referred values
   *
   * @returns {void}
   */
  _assignRefMap() {
    if (this._refMap.size) {
      const items = [...this._refMap];
      for (const [key, value] of items) {
        const target = this._getTargetFromNamespace(key);
        if (target) {
          const { $ref, namespace } = value;
          let refValue;
          if ($ref.includes('.')) {
            refValue = this._getTargetFromNamespace($ref);
          } else if (this._browser[$ref]) {
            refValue = this._browser[$ref];
          } else {
            refValue = this._browser[namespace]?.[$ref];
          }
          Object.assign(target, refValue);
        }
      }
      this._refMap.clear();
    }
  }

  /**
   * mock events
   *
   * @param {object} target - target object
   * @param {Array} events - events
   * @returns {object} - target object
   */
  _mockEvents(target, events) {
    if (!target) {
      throw new TypeError(`Expected Object but got ${getType(target)}.`);
    }
    if (!Array.isArray(events)) {
      throw new TypeError(`Expected Array but got ${getType(events)}.`);
    }
    for (const item of events) {
      const { name, type, unsupported } = item;
      if (!unsupported && name && type === 'function') {
        target[name] ??= {};
        target[name].addListener = this._sandbox.stub();
        target[name].hasListener = this._sandbox.stub();
        target[name].removeListener = this._sandbox.stub();
      }
    }
    return target;
  }

  /**
   * mock functions
   *
   * @param {object} target - target object
   * @param {Array} funcs - functions
   * @returns {object} - target object
   */
  _mockFunctions(target, funcs) {
    if (!target) {
      throw new TypeError(`Expected Object but got ${getType(target)}.`);
    }
    if (!Array.isArray(funcs)) {
      throw new TypeError(`Expected Array but got ${getType(funcs)}.`);
    }
    for (const item of funcs) {
      const { name, type, unsupported } = item;
      if (!unsupported && name && type === 'function') {
        target[name] = this._sandbox.stub();
      }
    }
    return target;
  }

  /**
   * mock properties
   *
   * @param {object} target - target object
   * @param {object} props - properties
   * @param {string} namespace - namespace
   * @returns {object} - target object
   */
  _mockProperties(target, props, namespace) {
    if (!target) {
      throw new TypeError(`Expected Object but got ${getType(target)}.`);
    }
    if (!props) {
      throw new TypeError(`Expected Object but got ${getType(props)}.`);
    }
    if (!isString(namespace)) {
      throw new TypeError(`Expected String but got ${getType(namespace)}.`);
    }
    const items = Object.entries(props);
    for (const [key, item] of items) {
      const { $ref, properties, type, unsupported } = item;
      if (!unsupported) {
        $ref && this._refMap.set(`${namespace}.${key}`, { $ref, namespace });
        if (Object.prototype.hasOwnProperty.call(item, 'value')) {
          target[key] = item.value;
        } else if (type === 'function') {
          target[key] = this._sandbox.stub();
        } else if (type === 'object' || $ref ||
                   Object.prototype.hasOwnProperty.call(item, 'properties')) {
          target[key] ??= {};
          properties && this._mockProperties(
            target[key], properties, `${namespace}.${key}`
          );
        } else {
          target[key] = null;
        }
      }
    }
    return target;
  }

  /**
   * mock types
   *
   * @param {object} target - target object
   * @param {Array} types - types
   * @param {string} namespace - namespace
   * @returns {object} - target object
   */
  _mockTypes(target, types, namespace) {
    if (!target) {
      throw new TypeError(`Expected Object but got ${getType(target)}.`);
    }
    if (!Array.isArray(types)) {
      throw new TypeError(`Expected Array but got ${getType(types)}.`);
    }
    if (!isString(namespace)) {
      throw new TypeError(`Expected String but got ${getType(namespace)}.`);
    }
    const items = Object.values(types);
    for (const item of items) {
      const { $import, events, functions, id, properties, type } = item;
      if (id) {
        $import &&
          this._importMap.set(`${namespace}.${id}`, { $import, namespace });
        if (type === 'object' || $import || events || functions || properties) {
          target[id] ??= {};
          events && this._mockEvents(target[id], events);
          functions && this._mockFunctions(target[id], functions);
          properties &&
            this._mockProperties(target[id], properties, `${namespace}.${id}`);
        } else {
          target[id] = null;
        }
      }
    }
    return target;
  }

  /**
   * parse schema content
   *
   * @returns {object} - schema
   */
  _parseSchemaContent() {
    const fileName = this.#channel === 'mail' ? 'mailext.json' : 'webext.json';
    const dirName = path.dirname(convertUriToFilePath(import.meta.url));
    const file = path.join(dirName, '../', 'schemas', this.#channel, fileName);
    const content = fs.readFileSync(file, {
      encoding: CHAR,
      flag: 'r'
    });
    this._schema = JSON.parse(content);
    return this._schema;
  }

  /**
   * get schema
   *
   * @param {string} name - API name or file name
   * @returns {Array} - schema
   */
  get(name) {
    if (!isString(name)) {
      throw new TypeError(`Expected String but got ${getType(name)}.`);
    }
    const schemas = this._schema ?? this._parseSchemaContent();
    const items = Object.entries(schemas);
    const label = decamelize(name.replace(/\.json$/, ''));
    let schema;
    for (const [key, value] of items) {
      if (decamelize(key.replace(/\.json$/, '')) === label) {
        schema = value;
        break;
      }
    }
    return schema || null;
  }

  /**
   * get all schemas
   *
   * @returns {object} - schemas
   */
  getAll() {
    const schemas = this._schema ?? this._parseSchemaContent();
    return schemas;
  }

  /**
   * list schemas
   *
   * @returns {Array} - file list
   */
  list() {
    const schemas = this._schema ?? this._parseSchemaContent();
    const items = Object.keys(schemas);
    const arr = [];
    for (const item of items) {
      arr.push(item);
    }
    return arr.sort();
  }

  /**
   * mock browser api
   *
   * @returns {object} - stubbed browser api
   */
  mock() {
    const schemas = this._schema ?? this._parseSchemaContent();
    const schemaItems = Object.entries(schemas);
    const aliasKeys = ['action', 'menus'];
    this._browser = {
      _sandbox: this._sandbox
    };
    this._importMap.clear();
    this._refMap.clear();
    for (const [key, value] of schemaItems) {
      const items = Object.values(value);
      for (const item of items) {
        const {
          $import, events, functions, namespace, properties, types
        } = item;
        const fileKey = camelize(key.replace(/\.json$/, '')).toLowerCase();
        const itemKey = namespace.replace(/\./g, '').toLowerCase();
        if (fileKey === itemKey || fileKey.startsWith(itemKey) ||
            itemKey.startsWith(fileKey) || aliasKeys.includes(itemKey) ||
            $import) {
          const mapKey = [];
          let ns;
          if (namespace.includes('.')) {
            const [itemNamespace, itemSubNamespace] = namespace.split('.');
            this._browser[itemNamespace] ??= {};
            this._browser[itemNamespace][itemSubNamespace] ??= {};
            mapKey.push(itemNamespace, itemSubNamespace);
            ns = this._browser[itemNamespace][itemSubNamespace];
          } else {
            this._browser[namespace] ??= {};
            mapKey.push(namespace);
            ns = this._browser[namespace];
          }
          $import &&
            this._importMap.set(mapKey.join('.'), { $import, namespace });
          events && this._mockEvents(ns, events);
          functions && this._mockFunctions(ns, functions);
          properties && this._mockProperties(ns, properties, namespace);
          types && this._mockTypes(ns, types, namespace);
        }
      }
    }
    this._importMap.size && this._assignImportMap();
    this._refMap.size && this._assignRefMap();
    return this._browser;
  }
}
