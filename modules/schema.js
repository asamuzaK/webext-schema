/**
 * schema.js
 */
"use strict";
/* api */
const {getType, isString} = require("./common");
const {readFile} = require("./file-util");
const camelize = require("camelize");
const decamelize = require("decamelize");
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
      isString(ch) && /(?:release|beta|central)/.test(ch) && ch || "release";
  }

  /* getter / setter */
  get channel() {
    return this._channel;
  }

  set channel(ch) {
    if (isString(ch) && /(?:release|beta|central)/.test(ch)) {
      this._channel = ch;
    }
  }

  /**
   * parse content
   * @returns {Object} - schema
   */
  async _parseContent() {
    const file = path.resolve(
      path.join(__dirname, "../", "schemas", this._channel, "all.json")
    );
    const content = await readFile(file, {
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
  async arrange(opt = {}) {
    const {name} = opt;
    const schemas = await this._parseContent();
    let schema;
    if (name === "sinon-chrome") {
      const items = Object.entries(schemas);
      const menusChild = await this.get("menus_child.json");
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
   * @returns {Object} - schema
   */
  async get(name) {
    if (!isString(name)) {
      throw new TypeError(`Expected String but got ${getType(name)}.`);
    }
    const schemas = await this._parseContent();
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
  async getAll() {
    const schemas = await this._parseContent();
    return schemas;
  }

  /**
   * list schemas
   * @returns {Array} - file list
   */
  async list() {
    const schemas = await this._parseContent();
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
