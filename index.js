/*!
 * webext-schema
 *
 * @license MPL-2.0
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/webext-schema/blob/master/LICENSE}
 */

/* api */
import process from 'node:process';
import { parseCommand } from './modules/commander.js';
import { logErr, throwErr } from './modules/common.js';
export { Schema } from './modules/schema.js';

/* process */
process.on('uncaughtException', throwErr);
process.on('unhandledRejection', logErr);

parseCommand(process.argv);
