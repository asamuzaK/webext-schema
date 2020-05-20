/**
 * update.js
 */
"use strict";
/* api */
const {URL} = require("url");
const JSON5 = require("json5");
const {getType, isString, throwErr} = require("./common");
const {createFile} = require("./file-util");
const {version} = require("../package.json");
const commander = require("commander");
const fetch = require("node-fetch");
const path = require("path");
const process = require("process");

/* constants */
const {CHAR, INDENT} = require("./constant");
const DIR_CWD = process.cwd();
const PERM_FILE = 0o644;
const ESR_VER = 68;

/**
 * fetch text
 *
 * @param {string} url - URL
 * @returns {string} - content text
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
 *
 * @param {string} channel - release channel
 * @returns {string} - channel URL
 */
const getChannelUrl = channel => {
  let dir;
  switch (channel) {
    case "central":
      dir = "mozilla-central/";
      break;
    case "esr":
      dir = `releases/mozilla-esr${ESR_VER}/`;
      break;
    case "mail":
      dir = "comm-central/";
      break;
    case "release":
      dir = "releases/mozilla-release/";
      break;
    default:
      dir = "releases/mozilla-beta/";
  }
  return `https://hg.mozilla.org/${dir}raw-file/tip/`;
};

/**
 * get schema data
 *
 * @param {string} file - file name
 * @param {string} baseUrl - base URL
 * @returns {object} - schema data
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
 * get schema file list from jar manifest
 *
 * @param {string} baseUrl - base URL
 * @returns {Array} - schema file list
 */
const getFileList = async baseUrl => {
  if (!isString(baseUrl)) {
    throw new TypeError(`Expected String but got ${getType(baseUrl)}.`);
  }
  const {href} = new URL("jar.mn", baseUrl);
  const text = await fetchText(href);
  const reg =
    /content\/(?:(?:brows|messeng)er|extensions)\/schemas\/([\da-zA-Z_]+\.json)/;
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
 * get all schema data
 *
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
 * get listed schema data
 *
 * @param {string} baseUrl - base URL
 * @param {Array} arr - array of schema file names
 * @returns {Array} - schema data in array
 */
const getListedSchemaData = async (baseUrl, arr) => {
  if (!isString(baseUrl)) {
    throw new TypeError(`Expected String but got ${getType(baseUrl)}.`);
  }
  if (!Array.isArray(arr)) {
    throw new TypeError(`Expected Array but got ${getType(arr)}.`);
  }
  const func = [];
  for (const item of arr) {
    func.push(getSchemaData(item, baseUrl));
  }
  return Promise.all(func);
};

/**
 * get MailExtensions schema data
 *
 * @param {string} baseUrl - base URL
 * @returns {Promise.<Array>} - results of each handler
 */
const getMailExtSchemaData = async baseUrl => {
  if (!isString(baseUrl)) {
    throw new TypeError(`Expected String but got ${getType(baseUrl)}.`);
  }
  const items = await getFileList(baseUrl);
  const schemaUrl = `${baseUrl}schemas/`;
  const excludeFile = [
    "commands.json",
    "pkcs11.json",
  ];
  const func = [];
  for (const item of items) {
    if (!excludeFile.includes(item)) {
      func.push(getSchemaData(item, schemaUrl));
    }
  }
  return Promise.all(func);
};

/**
 * create unified schema
 *
 * @param {string} channel - release channel
 * @returns {object} - schema
 */
const createUnifiedSchema = async channel => {
  const channelUrl = getChannelUrl(channel);
  const schema = {};
  let arr;
  if (channel === "mail") {
    const browserItems = [
      "commands.json",
      "pkcs11.json",
    ];
    const toolkitItems = [
      "content_scripts.json", "experiments.json", "extension.json", "i18n.json",
      "management.json", "permissions.json", "runtime.json", "theme.json",
    ];
    const browserBaseUrl =
      `${getChannelUrl("central")}browser/components/extensions/schemas/`;
    const toolkitBaseUrl =
      `${getChannelUrl("central")}toolkit/components/extensions/schemas/`;
    arr = await Promise.all([
      getListedSchemaData(browserBaseUrl, browserItems),
      getListedSchemaData(toolkitBaseUrl, toolkitItems),
      getMailExtSchemaData(`${channelUrl}mail/components/extensions/`),
    ]);
  } else {
    arr = await Promise.all([
      getAllSchemaData(`${channelUrl}browser/components/extensions/schemas/`),
      getAllSchemaData(`${channelUrl}toolkit/components/extensions/schemas/`),
    ]);
  }
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
 *
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
  const fileName = channel === "mail" && "mailext" || "webext";
  const filePath =
    path.resolve(path.join(DIR_CWD, "schemas", channel, `${fileName}.json`));
  const file = await createFile(filePath, content, {
    encoding: CHAR, flag: "w", mode: PERM_FILE,
  });
  if (file && info) {
    console.info(`Created: ${file}`);
  }
  return file;
};

/**
 * update schemas files
 *
 * @param {object} cmdOpts - command options
 * @returns {Promise.<Array>} - Promise chain
 */
const updateSchemas = (cmdOpts = {}) => {
  const {channel, info} = cmdOpts;
  const func = [];
  if (channel) {
    func.push(saveSchemaFile(channel, info));
  } else {
    func.push(
      saveSchemaFile("beta", info),
      saveSchemaFile("central", info),
      saveSchemaFile("esr", info),
      saveSchemaFile("release", info),
      saveSchemaFile("mail", info),
    );
  }
  return Promise.all(func).catch(throwErr);
};

/**
 * parse command
 *
 * @param {Array} args - process.argv
 * @returns {void}
 */
const parseCommand = args => {
  const reg = /^(?:(?:--)?help|-[h|v]|--version|u(?:pdate)?)$/;
  if (Array.isArray(args) && args.some(arg => reg.test(arg))) {
    commander.exitOverride();
    commander.version(version, "-v, --version");
    commander.command("update").alias("u").description("update schemas")
      .option("-c, --channel <name>", "specify the release channel")
      .option("-i, --info", "console info")
      .action(updateSchemas);
    try {
      commander.parse(args);
    } catch (e) {
      // fail through
    }
  }
};

module.exports = {
  ESR_VER,
  commander,
  createUnifiedSchema,
  fetchText,
  getAllSchemaData,
  getChannelUrl,
  getFileList,
  getListedSchemaData,
  getMailExtSchemaData,
  getSchemaData,
  parseCommand,
  saveSchemaFile,
  updateSchemas,
};
