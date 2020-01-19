/**
 * schema.js
 */
"use strict";
/* api */
const {getType, isString} = require("./common");
const camelize = require("camelize");
const decamelize = require("decamelize");
const fs = require("fs");
const path = require("path");
const sinon = require("sinon");

/* constants */
const {CHAR} = require("./constant");

class Schema {
  /**
   * construct
   * @param {string} [ch] - release channel
   */
  constructor(ch) {
    this._channel =
      isString(ch) && /(?:(?:centra|mai)l|beta|release)/.test(ch) && ch ||
      "beta";
    this._importMap = new Map();
    this._refMap = new Map();
    this._sandbox = sinon.createSandbox();
    this._browser;
  }

  /* getter / setter */
  get channel() {
    return this._channel;
  }

  set channel(ch) {
    if (isString(ch) && /(?:(?:centra|mai)l|beta|release)/.test(ch)) {
      this._channel = ch;
    }
  }

  /**
   * assign imported value
   * @returns {void}
   */
  _assignImportMap() {
    if (this._importMap.size) {
      const items = Array.from(this._importMap);
      for (const [key, value] of items) {
        const [...itemKeys] = key.split(".");
        const l = itemKeys.length;
        let i = 0, target = this._browser;
        while (i < l) {
          target = target[itemKeys[i]];
          i++;
        }
        if (target) {
          const {$import, namespace} = value;
          let importValue;
          if ($import.includes(".")) {
            const [importNs, propKey] = $import.split(".");
            importValue =
              this._browser[importNs] && this._browser[importNs][propKey];
          } else if (this._browser[$import]) {
            importValue = this._browser[$import];
          } else {
            importValue =
              this._browser[namespace] && this._browser[namespace][$import];
          }
          Object.assign(target, importValue);
        }
      }
      this._importMap.clear();
    }
  }

  /**
   * assign referred value
   * @returns {void}
   */
  _assignRefMap() {
    if (this._refMap.size) {
      const items = Array.from(this._refMap);
      for (const [key, value] of items) {
        const [...itemKeys] = key.split(".");
        const l = itemKeys.length;
        let i = 0, target = this._browser;
        while (i < l) {
          target = target[itemKeys[i]];
          i++;
        }
        if (target) {
          const {$ref, namespace} = value;
          let refValue;
          if ($ref.includes(".")) {
            const [refNs, propKey] = $ref.split(".");
            refValue = this._browser[refNs] && this._browser[refNs][propKey];
          } else if (this._browser[$ref]) {
            refValue = this._browser[$ref];
          } else {
            refValue =
              this._browser[namespace] && this._browser[namespace][$ref];
          }
          Object.assign(target, refValue);
        }
      }
      this._refMap.clear();
    }
  }

  /**
   * mock events
   * @param {Object} target - target object
   * @param {Array} events - events
   * @returns {Object} - target object
   */
  _mockEvents(target, events) {
    if (!target) {
      throw new TypeError(`Expected Object but got ${getType(target)}.`);
    }
    if (!Array.isArray(events)) {
      throw new TypeError(`Expected Array but got ${getType(events)}.`);
    }
    for (const item of events) {
      const {name, type, unsupported} = item;
      if (!unsupported && name && type === "function") {
        if (!target[name]) {
          target[name] = {};
        }
        target[name].addListener = this._sandbox.stub();
        target[name].hasListener = this._sandbox.stub();
        target[name].removeListener = this._sandbox.stub();
      }
    }
    return target;
  }

  /**
   * mock functions
   * @param {Object} target - target object
   * @param {Array} funcs - functions
   * @returns {Object} - target object
   */
  _mockFunctions(target, funcs) {
    if (!target) {
      throw new TypeError(`Expected Object but got ${getType(target)}.`);
    }
    if (!Array.isArray(funcs)) {
      throw new TypeError(`Expected Array but got ${getType(funcs)}.`);
    }
    for (const item of funcs) {
      const {name, type, unsupported} = item;
      if (!unsupported && name && type === "function") {
        target[name] = this._sandbox.stub();
      }
    }
    return target;
  }

  /**
   * mock properties
   * @param {Object} target - target object
   * @param {Object} props - properties
   * @param {string} namespace - namespace
   * @returns {Object} - target object
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
      const {$ref, properties, type, unsupported} = item;
      if (!unsupported) {
        $ref && this._refMap.set(`${namespace}.${key}`, {$ref, namespace});
        if (item.hasOwnProperty("value")) {
          target[key] = item.value;
        } else if (type === "function") {
          target[key] = this._sandbox.stub();
        } else if (type === "object" || $ref ||
                   item.hasOwnProperty("properties")) {
          if (!target[key]) {
            target[key] = {};
          }
          properties && this._mockProperties(
            target[key], properties, `${namespace}.${key}`,
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
   * @param {Object} target - target object
   * @param {Array} types - types
   * @param {string} namespace - namespace
   * @returns {Object} - target object
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
      const {$import, events, functions, id, properties, type} = item;
      if (id) {
        $import &&
          this._importMap.set(`${namespace}.${id}`, {$import, namespace});
        if (type === "object" || $import || events || functions || properties) {
          if (!target[id]) {
            target[id] = {};
          }
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
   * @returns {Object} - schema
   */
  _parseSchemaContent() {
    const fileName =
      this._channel === "mail" && "mailext.json" || "webext.json";
    const file = path.resolve(
      path.join(__dirname, "../", "schemas", this._channel, fileName),
    );
    const content = fs.readFileSync(file, {
      encoding: CHAR,
      flag: "r",
    });
    const schema = JSON.parse(content);
    return schema;
  }

  /**
   * arrange schema to fit specific application
   * @param {Object} opt - options
   * @param {string} opt.name - app name
   * @returns {*} - arranged schema
   */
  arrange(opt = {}) {
    const {name} = opt;
    if (!isString(name)) {
      throw new TypeError(`Expected String but got ${getType(name)}.`);
    }
    const schemas = this._parseSchemaContent();
    let schema;
    if (name === "sinon-chrome") {
      const items = Object.entries(schemas);
      const arr = [];
      for (const [key, item] of items) {
        const subItems = Object.values(item);
        for (const subItem of subItems) {
          const schemaItems = Object.entries(subItem);
          for (const [schemaKey, schemaKeyValue] of schemaItems) {
            if (schemaKey === "namespace") {
              const camelizedKey = camelize(key.replace(/\.json$/, ""));
              const camelizedSchemaKey = camelize(schemaKeyValue);
              if (camelizedKey === camelizedSchemaKey ||
                  camelizedSchemaKey.startsWith(camelizedKey) ||
                  camelizedKey.startsWith(camelizedSchemaKey)) {
                arr.push(subItem);
              }
            }
          }
        }
      }
      schema = [];
      for (const item of arr) {
        const {events, functions, namespace, types} = item;
        if (events || functions) {
          if (namespace === "menus") {
            if (types) {
              const menusChild = this.get("menus_child.json");
              const [{functions: menusChildFunctions}] = menusChild;
              const contextMenus = Object.assign({}, item);
              contextMenus.namespace = "contextMenus";
              contextMenus.permissions = "contextMenus";
              for (const func of menusChildFunctions) {
                functions.push(func);
              }
              schema.push(contextMenus);
              schema.push(item);
            }
          } else {
            schema.push(item);
          }
        }
      }
    }
    return schema || null;
  }

  /**
   * get schema
   * @param {string} name - API name or file name
   * @returns {Array} - schema
   */
  get(name) {
    if (!isString(name)) {
      throw new TypeError(`Expected String but got ${getType(name)}.`);
    }
    const schemas = this._parseSchemaContent();
    const items = Object.entries(schemas);
    const label = decamelize(name.replace(/\.json$/, ""));
    let schema;
    for (const [key, value] of items) {
      if (decamelize(key.replace(/\.json$/, "")) === label) {
        schema = value;
        break;
      }
    }
    return schema || null;
  }

  /**
   * get all schemas
   * @returns {Object} - schemas
   */
  getAll() {
    const schemas = this._parseSchemaContent();
    return schemas;
  }

  /**
   * list schemas
   * @returns {Array} - file list
   */
  list() {
    const schemas = this._parseSchemaContent();
    const items = Object.keys(schemas);
    const arr = [];
    for (const item of items) {
      arr.push(item);
    }
    return arr.sort();
  }

  /**
   * mock browser api
   * @returns {Object} - stubbed browser api
   */
  mock() {
    const schemas = this._parseSchemaContent();
    const schemaItems = Object.entries(schemas);
    this._browser = {
      _sandbox: this._sandbox,
    };
    this._importMap.clear();
    this._refMap.clear();
    for (const [key, value] of schemaItems) {
      const items = Object.values(value);
      for (const item of items) {
        const {
          $import, events, functions, namespace, properties, types,
        } = item;
        const fileKey = camelize(key.replace(/\.json$/, "")).toLowerCase();
        const itemKey = namespace.replace(/\./g, "").toLowerCase();
        if (fileKey === itemKey || fileKey.startsWith(itemKey) || $import) {
          const mapKey = [];
          let ns;
          if (namespace.includes(".")) {
            const [itemNamespace, itemSubNamespace] = namespace.split(".");
            if (!this._browser[itemNamespace][itemSubNamespace]) {
              this._browser[itemNamespace][itemSubNamespace] = {};
            }
            mapKey.push(itemNamespace, itemSubNamespace);
            ns = this._browser[itemNamespace][itemSubNamespace];
          } else {
            if (!this._browser[namespace]) {
              this._browser[namespace] = {};
            }
            mapKey.push(namespace);
            ns = this._browser[namespace];
          }
          $import &&
            this._importMap.set(mapKey.join("."), {$import, namespace});
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

module.exports = {
  Schema,
};
