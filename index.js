/**
 * index.js
 */

/* api */
import { Schema } from './modules/schema.js';
import { logErr, throwErr } from './modules/common.js';
import { parseCommand } from './modules/update.js';
import process from 'process';

/* process */
process.on('uncaughtException', throwErr);
process.on('unhandledRejection', logErr);

parseCommand(process.argv);

export {
  Schema
};
