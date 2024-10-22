/**
 * update.js
 */
/* eslint-disable no-await-in-loop */

/* api */
import path from 'node:path';
import process from 'node:process';
import JSON5 from 'json5';
import { getType, isString } from './common.js';
import { createFile } from './file-util.js';

/* constants */
import { CHAR, INDENT } from './constant.js';
const DIR_CWD = process.cwd();
const PERM_FILE = 0o644;
export const ESR_VER = 128;

/**
 * fetch text
 * @param {string} url - URL
 * @returns {Promise.<string>} - content text
 */
export const fetchText = async url => {
  if (!isString(url)) {
    throw new TypeError(`Expected String but got ${getType(url)}.`);
  }
  const res = await fetch(url);
  const { ok, status } = res;
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
export const getChannelUrl = channel => {
  let dir;
  switch (channel) {
    case 'central':
      dir = 'mozilla-central/';
      break;
    case 'esr':
      dir = `releases/mozilla-esr${ESR_VER}/`;
      break;
    case 'mail':
      dir = 'comm-central/';
      break;
    case 'release':
      dir = 'releases/mozilla-release/';
      break;
    default:
      dir = 'releases/mozilla-beta/';
  }
  return `https://hg.mozilla.org/${dir}raw-file/tip/`;
};

/**
 * get schema data
 * @param {string} file - file name
 * @param {string} baseUrl - base URL
 * @returns {Promise.<object>} - schema data
 */
export const getSchemaData = async (file, baseUrl) => {
  if (!isString(file)) {
    throw new TypeError(`Expected String but got ${getType(file)}.`);
  }
  if (!isString(baseUrl)) {
    throw new TypeError(`Expected String but got ${getType(baseUrl)}.`);
  }
  const { href } = new URL(file, baseUrl);
  const text = await fetchText(href);
  const schema = JSON5.parse(text);
  return {
    file, schema
  };
};

/**
 * get schema file list from jar manifest
 * @param {string} baseUrl - base URL
 * @returns {Promise.<Array.<string>>} - schema file list
 */
export const getFileList = async baseUrl => {
  if (!isString(baseUrl)) {
    throw new TypeError(`Expected String but got ${getType(baseUrl)}.`);
  }
  const { href } = new URL('jar.mn', baseUrl);
  const text = await fetchText(href);
  const reg =
    /content\/(?:(?:brows|messeng)er|extensions)\/schemas\/(\w+\.json)/;
  const items = text.split('\n');
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
 * @param {string} baseUrl - base URL
 * @param {boolean} info - console info
 * @returns {Promise.<Array.<object>>} - schemas data in array
 */
export const getAllSchemaData = async (baseUrl, info) => {
  if (!isString(baseUrl)) {
    throw new TypeError(`Expected String but got ${getType(baseUrl)}.`);
  }
  const schemas = [];
  const items = await getFileList(baseUrl);
  for (const item of items) {
    if (info) {
      console.info(`Fetching ${item}`);
    }
    const schema = await getSchemaData(item, baseUrl);
    schemas.push(schema);
  }
  return schemas;
};

/**
 * get listed schema data
 * @param {string} baseUrl - base URL
 * @param {Array} arr - array of schema file names
 * @param {boolean} info - console info
 * @returns {Promise.<Array.<object>>} - schema data in array
 */
export const getListedSchemaData = async (baseUrl, arr, info) => {
  if (!isString(baseUrl)) {
    throw new TypeError(`Expected String but got ${getType(baseUrl)}.`);
  }
  if (!Array.isArray(arr)) {
    throw new TypeError(`Expected Array but got ${getType(arr)}.`);
  }
  const schemas = [];
  for (const item of arr) {
    if (info) {
      console.info(`Fetching ${item}`);
    }
    const schema = await getSchemaData(item, baseUrl);
    schemas.push(schema);
  }
  return schemas;
};

/**
 * get MailExtensions schema data
 * @param {string} baseUrl - base URL
 * @param {boolean} info - console info
 * @returns {Promise.<Array.<object>>} - results of each handler
 */
export const getMailExtSchemaData = async (baseUrl, info) => {
  if (!isString(baseUrl)) {
    throw new TypeError(`Expected String but got ${getType(baseUrl)}.`);
  }
  const items = await getFileList(baseUrl);
  const schemaUrl = `${baseUrl}schemas/`;
  const excludeFile = [
    'commands.json',
    'pkcs11.json'
  ];
  const schemas = [];
  for (const item of items) {
    if (!excludeFile.includes(item)) {
      if (info) {
        console.info(`Fetching ${item}`);
      }
      const schema = await getSchemaData(item, schemaUrl);
      schemas.push(schema);
    }
  }
  return schemas;
};

/**
 * create unified schema
 * @param {string} channel - release channel
 * @param {boolean} info - console info
 * @returns {Promise.<object>} - schema
 */
export const createUnifiedSchema = async (channel, info) => {
  const channelUrl = getChannelUrl(channel);
  const schema = {};
  let arr;
  if (channel === 'mail') {
    const browserItems = [
      'commands.json',
      'pkcs11.json'
    ];
    const toolkitItems = [
      'content_scripts.json', 'experiments.json', 'extension.json', 'i18n.json',
      'management.json', 'permissions.json', 'runtime.json', 'theme.json'
    ];
    const browserBaseUrl =
      `${getChannelUrl('central')}browser/components/extensions/schemas/`;
    const toolkitBaseUrl =
      `${getChannelUrl('central')}toolkit/components/extensions/schemas/`;
    arr = await Promise.all([
      getListedSchemaData(browserBaseUrl, browserItems, info),
      getListedSchemaData(toolkitBaseUrl, toolkitItems, info),
      getMailExtSchemaData(`${channelUrl}mail/components/extensions/`, info)
    ]);
  } else {
    arr = await Promise.all([
      getAllSchemaData(`${channelUrl}browser/components/extensions/schemas/`,
        info),
      getAllSchemaData(`${channelUrl}toolkit/components/extensions/schemas/`,
        info)
    ]);
  }
  for (const items of arr) {
    for (const item of items) {
      const { file, schema: itemSchema } = item;
      schema[file] = itemSchema;
    }
  }
  return schema;
};

/**
 * save schema file
 * @param {string} channel - release channel
 * @param {boolean} info - console info
 * @returns {Promise.<string>} - file path
 */
export const saveSchemaFile = async (channel, info) => {
  if (!isString(channel)) {
    throw new TypeError(`Expected String but got ${getType(channel)}.`);
  }
  const schema = await createUnifiedSchema(channel, info);
  const content = `${JSON.stringify(schema, null, INDENT)}\n`;
  const fileName = channel === 'mail' ? 'mailext' : 'webext';
  const filePath =
    path.resolve(DIR_CWD, 'schemas', channel, `${fileName}.json`);
  const file = await createFile(filePath, content, {
    encoding: CHAR, flag: 'w', mode: PERM_FILE
  });
  if (file && info) {
    console.info(`Created: ${file}`);
  }
  return file;
};

/**
 * update schemas files
 * @param {object} cmdOpts - command options
 * @returns {Promise.<void>} - void
 */
export const updateSchemas = async (cmdOpts = {}) => {
  const { channel, info } = cmdOpts;
  const func = [];
  if (channel) {
    func.push(saveSchemaFile(channel, info));
  } else {
    func.push(
      saveSchemaFile('beta', info),
      saveSchemaFile('central', info),
      saveSchemaFile('esr', info),
      saveSchemaFile('release', info),
      saveSchemaFile('mail', info)
    );
  }
  const arr = await Promise.allSettled(func);
  for (const i of arr) {
    const { reason, status } = i;
    if (status === 'rejected' && reason) {
      console.trace(reason);
    }
  }
};
