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

/* constants */
const {CHAR} = require("./constant");

class Schema {
  /**
   * construct
   * @param {string} [ch] - release channel
   */
  constructor(ch) {
    this._channel =
      isString(ch) && /(?:beta|central|release)/.test(ch) && ch || "beta";
  }

  /* getter / setter */
  get channel() {
    return this._channel;
  }

  set channel(ch) {
    if (isString(ch) && /(?:beta|central|release)/.test(ch)) {
      this._channel = ch;
    }
  }

  /**
   * parse schema content
   * @returns {Object} - schema
   */
  _parseSchemaContent() {
    const file = path.resolve(
      path.join(__dirname, "../", "schemas", this._channel, "webext.json")
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
      const menusChild = this.get("menus_child.json");
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
      if (decamelize(key.replace(/.json$/, "")) === label) {
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
}

module.exports = {
  Schema,
};
