/**
 * setup.js
 */

import { Schema } from '../../index.js';
import process from 'process';

/**
 * get channel
 *
 * @returns {string} - channel
 */
const getChannel = () => {
  let ch;
  const reg = /(?<=--channel=)[a-z]+/;
  const args = process.argv.filter(arg => reg.test(arg));
  if (args.length) {
    [ch] = reg.exec(args);
  } else {
    ch = 'beta';
  }
  return ch;
};

const channel = getChannel();

console.log(`Channel: ${channel}`);

export const browser = new Schema(channel).mock();

export const mockPort = ({ name, sender }) => {
  const port = Object.assign({}, browser.runtime.Port);
  port.name = name;
  port.sender = sender;
  return port;
};

browser.i18n.getMessage.callsFake((...args) => args.toString());
browser.permissions.contains.resolves(true);

global.browser = browser;
