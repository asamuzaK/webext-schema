/**
 * update.js
 */
"use strict";
/* api */
const {URL} = require("url");
const JSON5 = require("json5");
const {getType, isString, throwErr} = require("./common");
const {createFile} = require("./file-util");
const fetch = require("node-fetch");
const path = require("path");
const process = require("process");

/* constants */
const {CHAR, INDENT} = require("./constant");
const DIR_CWD = process.cwd();
const PERM_FILE = 0o644;

/**
 * fetch text
 * @param {string} url - URL
 * @param {string} - content text
 */
const fetchText = async url => {
  if (!isString(url)) {
    throw new TypeError(`Expected String but got ${getType(url)}.`);
  }
  const res = await fetch(url);
  const {ok, status} = res;
  if (!ok) {
    const msg = `Network response was not ok. status: ${status}`;
    throw new Error(msg);
  }
  return res.text();
};

/**
 * get channel url
 * @param {string} channel - release channel
 * @returns {string} - channel URL
 */
const getChannelUrl = channel => {
  let dir;
  switch (channel) {
    case "beta":
      dir = "releases/mozilla-beta/";
      break;
    case "central":
      dir = "mozilla-central/";
      break;
    default:
      dir = "releases/mozilla-release/";
  }
  return `https://hg.mozilla.org/${dir}raw-file/tip/`;
};

/**
 * get schema file list from jar manifest
 * @param {string} baseUrl - base URL
 * @returns {Array} - schema file list
 */
const getFileList = async baseUrl => {
  if (!isString(baseUrl)) {
    throw new TypeError(`Expected String but got ${getType(baseUrl)}.`);
  }
  const {href} = new URL("jar.mn", baseUrl);
  const text = await fetchText(href);
  const reg = /content\/(?:browser|extensions)\/schemas\/([\da-zA-Z_]+\.json)/;
  const items = text.split("\n");
  const arr = [];
  for (const item of items) {
    const res = reg.exec(item);
    if (res) {
      const [, file] = res;
      arr.push(file);
    }
  }
  return arr;
};

/**
 * get schema data
 * @param {string} file - file name
 * @param {string} baseUrl - base URL
 * @returns {Object} - schema data
 */
const getSchemaData = async (file, baseUrl) => {
  if (!isString(file)) {
    throw new TypeError(`Expected String but got ${getType(file)}.`);
  }
  if (!isString(baseUrl)) {
    throw new TypeError(`Expected String but got ${getType(baseUrl)}.`);
  }
  const {href} = new URL(file, baseUrl);
  const text = await fetchText(href);
  const schema = JSON5.parse(text);
  return {
    file, schema,
  };
};

/**
 * get all schema data
 * @param {string} baseUrl - base URL
 * @returns {Array} - schemas data in array
 */
const getAllSchemaData = async baseUrl => {
  if (!isString(baseUrl)) {
    throw new TypeError(`Expected String but got ${getType(baseUrl)}.`);
  }
  const items = await getFileList(baseUrl);
  const func = [];
  for (const item of items) {
    func.push(getSchemaData(item, baseUrl));
  }
  return Promise.all(func);
};

/**
 * create unified schema
 * @param {string} channel - release channel
 * @returns {Object} - schema
 */
const createUnifiedSchema = async channel => {
  const channelUrl = getChannelUrl(channel);
  const arr = await Promise.all([
    getAllSchemaData(`${channelUrl}browser/components/extensions/schemas/`),
    getAllSchemaData(`${channelUrl}toolkit/components/extensions/schemas/`),
  ]);
  const schema = {};
  for (const items of arr) {
    for (const item of items) {
      const {file, schema: itemSchema} = item;
      schema[file] = itemSchema;
    }
  }
  return schema;
};

/**
 * save schema file
 * @param {string} channel - release channel
 * @param {boolean} info - console info
 * @returns {string} - file path
 */
const saveSchemaFile = async (channel, info) => {
  if (!isString(channel)) {
    throw new TypeError(`Expected String but got ${getType(channel)}.`);
  }
  const schema = await createUnifiedSchema(channel);
  const content = `${JSON.stringify(schema, null, INDENT)}\n`;
  const filePath = path.resolve(
    path.join(DIR_CWD, "schemas", channel, "all.json")
  );
  const file = await createFile(filePath, content, {
    encoding: CHAR, flag: "w", mode: PERM_FILE,
  });
  if (file && info) {
    console.info(`Created: ${filePath}`);
  }
  return filePath;
};

/**
 * update schemas files
 * @param {Object} cmdOpts - command options
 * @returns {Promise.<Array>} - Promise chain
 */
const updateSchemas = (cmdOpts = {}) => {
  const {channel, info} = cmdOpts;
  const func = [];
  if (channel) {
    func.push(saveSchemaFile(channel, info));
  } else {
    func.push(
      saveSchemaFile("release", info),
      saveSchemaFile("beta", info),
      saveSchemaFile("central", info),
    );
  }
  return Promise.all(func).catch(throwErr);
};

module.exports = {
  createUnifiedSchema,
  fetchText,
  getAllSchemaData,
  getChannelUrl,
  getFileList,
  getSchemaData,
  saveSchemaFile,
  updateSchemas,
};
