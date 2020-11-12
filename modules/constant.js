/**
 * constants.js
 */
'use strict';
/* api */
const os = require('os');

/* constants */
const CHAR = 'utf8';
const DIR_HOME = os.homedir();
const INDENT = 2;
const IS_BE = os.endianness() === 'BE';
const IS_LE = os.endianness() === 'LE';
const IS_MAC = os.platform() === 'darwin';
const IS_WIN = os.platform() === 'win32';

module.exports = {
  CHAR, DIR_HOME, INDENT, IS_BE, IS_LE, IS_MAC, IS_WIN
};
