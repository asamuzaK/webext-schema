/**
 * index.js
 */
'use strict';
/* api */
const { Schema } = require('./modules/schema');
const { logErr, throwErr } = require('./modules/common');
const { parseCommand } = require('./modules/update');
const process = require('process');

/* process */
process.on('uncaughtException', throwErr);
process.on('unhandledRejection', logErr);

parseCommand(process.argv);

module.exports = {
  Schema
};
