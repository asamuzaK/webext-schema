/**
 * constants.js
 */

/* api */
import os from 'os';

/* constants */
export const CHAR = 'utf8';
export const DIR_HOME = os.homedir();
export const INDENT = 2;
export const IS_BE = os.endianness() === 'BE';
export const IS_LE = os.endianness() === 'LE';
export const IS_MAC = os.platform() === 'darwin';
export const IS_WIN = os.platform() === 'win32';
