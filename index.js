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
export { Schema } from './modules/schema.js';

/* process */
process.on('uncaughtException', err => {
  console.error('Fatal Error (Uncaught Exception):', err);
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  console.error('Fatal Error (Unhandled Rejection):', reason);
  process.exit(1);
});

parseCommand(process.argv);
