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
   * get schema
   * @returns {Object} - schema
   */
  async _getSchema() {
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
   * list schemas
   * @returns {Array} - file list
   */
  async list() {
    const schema = await this._getSchema();
    const items = Object.keys(schema);
    const arr = [];
    for (const item of items) {
      arr.push(item);
    }
    return arr.sort();
  }

  /**
   * get schema
   * @param {string} file - file name
   * @returns {Object} - schema
   */
  async get(file) {
    if (!isString(file)) {
      throw new TypeError(`Expected String but got ${getType(file)}.`);
    }
    const schema = await this._getSchema();
    const items = Object.entries(schema);
    const label = decamelize(file.replace(/\.json$/, ""));
    let res;
    for (const [key, value] of items) {
      if (decamelize(key.replace(/.json$/, "")) === label) {
        res = value;
        break;
      }
    }
    return res || null;
  }

  /**
   * get all schemas
   * @param {Object} [opt] - options
   * @param {string} [opt.module] - formats schema to fit the specified module
   * @returns {Object} - schemas
   */
  async getAll(opt = {}) {
    const {module} = opt;
    const schema = await this._getSchema();
    let allSchema;
    if (module === "sinon-chrome") {
      const items = Object.entries(schema);
      allSchema = [];
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
                  camelizedKey.startsWith(camelizedSchemaKey) ||
                  camelizedSchemaKey === "contextMenus") {
                allSchema.push(subItem);
              }
              break;
            }
          }
        }
      }
    } else {
      allSchema = schema;
    }
    return allSchema;
  }
}

module.exports = {
  Schema,
};
