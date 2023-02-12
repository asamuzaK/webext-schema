/*!
 * webext-schema
 *
 * @license MPL-2.0
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/webext-schema/blob/master/LICENSE}
 */

/* api */
import { logErr, throwErr } from './modules/common.js';
import { parseCommand } from './modules/update.js';
import process from 'node:process';
export { Schema } from './modules/schema.js';

/* process */
process.on('uncaughtException', throwErr);
process.on('unhandledRejection', logErr);

parseCommand(process.argv);
