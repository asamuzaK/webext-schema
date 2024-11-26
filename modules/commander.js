/**
 * commander.js
 */

/* api */
import path from 'node:path';
import process from 'node:process';
import { program as commander } from 'commander';
import { isDir, removeDir } from './file-util.js';
import { updateSchemas } from './update.js';

/* constants */
const DIR_CWD = process.cwd();

/**
 * clean directory
 * @param {object} cmdOpts - command options
 * @returns {void}
 */
export const cleanDirectory = (cmdOpts = {}) => {
  const { dir, info } = cmdOpts;
  if (isDir(dir)) {
    removeDir(path.resolve(dir), DIR_CWD);
    if (info) {
      console.info(`Removed: ${path.resolve(dir)}`);
    }
  }
};

/**
 * parse command
 * @param {Array} args - process.argv
 * @returns {void}
 */
export const parseCommand = args => {
  const reg = /^(?:(?:--)?help|-[hv]|--version|c(?:lean)?|u(?:pdate)?)$/;
  if (Array.isArray(args) && args.some(arg => reg.test(arg))) {
    commander.exitOverride();
    commander.version(process.env.npm_package_version, '-v, --version');
    if (args.includes('clean') || args.includes('c')) {
      commander.command('clean').alias('c')
        .description('clean directory')
        .option('-d, --dir <name>', 'specify directory')
        .option('-i, --info', 'console info')
        .action(cleanDirectory);
    } else if (args.includes('update') || args.includes('u')) {
      commander.command('update').alias('u').description('update schemas')
        .option('-c, --channel <name>', 'specify the release channel')
        .option('-i, --info', 'console info')
        .action(updateSchemas);
    }
    commander.parse(args);
  }
};

/* For test */
export {
  commander
};
