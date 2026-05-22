# webext-schema

[![build](https://github.com/asamuzaK/webext-schema/workflows/build/badge.svg)](https://github.com/asamuzaK/webext-schema/actions?query=workflow%3Abuild)
[![CodeQL](https://github.com/asamuzaK/webext-schema/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/asamuzaK/webext-schema/actions/workflows/github-code-scanning/codeql)
[![npm](https://img.shields.io/npm/v/webext-schema)](https://www.npmjs.com/package/webext-schema)

[WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions "Browser Extensions - Mozilla | MDN") schemas and [MailExtensions](https://developer.thunderbird.net/add-ons/mailextensions "A Guide to Extensions - Thunderbird") schemas fetched from [hg.mozilla.org](https://hg.mozilla.org/).
Stubbed browser API and a standalone browser utility script are also available.

## Features

* **Up-to-date Schemas:** Directly fetched from Mozilla's repositories.
* **Multi-Channel Support:** Choose between `beta`, `central`, and `mail` channels to match your target environment.
* **Easy API Mocking:** Instantly generate a stubbed `browser` object powered by [Sinon.JS](https://sinonjs.org/) for robust unit testing of your extensions.
* **Standalone Utility Included:** Comes with `browser.js`, a dependency-free, Promise-wrapped utility script ready to be dropped into your extension project for easier API handling.
* **Modern ESM & TypeScript:** Native ES Modules support with bundled TypeScript definitions (`index.d.ts`).

## Install

```console
npm i webext-schema
```

## Usage (Schema & Mock)

```javascript
import { Schema } from 'webext-schema';

const schema = new Schema();
```

### new Schema(<var>channel</var>, <var>sinonConfig</var>)

* @param {string} [channel] - release channel. one of "beta", "central", "mail".
* @param {Object} [sinonConfig] - optional configuration for `sinon.createSandbox()`, see [Sinon.JS](https://sinonjs.org/) for details.

Both arguments are optional.

```javascript
const schema = new Schema("central", {
  useFakeTimers: true,
  useFakeServer: true,
});
```

### schema.channel

"central", "beta" for WebExtensions, and "mail" for MailExtensions are available.
Channel defaults to "beta".

```javascript
const schema = new Schema("central");
```

Also, you can set it afterwards.

```javascript
const schema = new Schema();
schema.channel = "central";
```

### schema.get(<var>name</var>)

* @param {string} name - API name or file name
* @returns {?Array} - schema

Get the schema for the specific API.
Argument can be either an API name or a file name.

```javascript
const schema = new Schema().get("browserAction");
// [{namespace: "browserAction", events: [...], ...}]
```

```javascript
const schema = new Schema().get("browser_action.json");
// [{namespace: "browserAction", events: [...], ...}]
```

### schema.getAll()

* @returns {Object} - all schemas

Get all schemas as a single object.
Note that the key of the object is the file name and the value is the schema.

```javascript
const schema = new Schema().getAll();
// {"alarms.json": [{...}], "bookmarks.json": [{...}], ...}
```

### schema.list()

* @returns {Array} - file names

Get the list of schema files.

```javascript
const list = new Schema().list();
// ["alarms.json", "bookmarks.json", ...]
```

### schema.mock()

* @returns {Object} - stubbed browser api

Creates stubbed browser API.

* Functions are stubbed by `sinon.sandbox.stub()`.
* You can access sandbox object via `browser._sandbox`.
  As an example of usage, call `browser._sandbox.reset()` before and/or after each test to initialize all the stubbed functions.
* Optionally, you can pass sinon configuration object as an argument when creating a schema instance.

See [Sinon.JS](https://sinonjs.org/) for details of sinon.sandbox.

```javascript
const browser = new Schema().mock();

// example of mocking runtime.connect()
const mockConnect = browser.runtime.connect.callsFake(({ name }) => {
  const port = Object.assign({}, browser.runtime.Port);
  port.name = name;
  return port;
});

const port1 = mockConnect({ name: "foo" });
const port2 = mockConnect({ name: "bar" });
assert.strictEqual(port1.name, "foo");
assert.isFunction(port1.onDisconnect.addListener);
assert.strictEqual(port2.name, "bar");
assert.isFunction(port2.onDisconnect.addListener);

// reset
browser._sandbox.reset();
```

---

## Browser Utility (`browser.js`)

A standalone utility script (`browser.js`) is also included in this repository. It provides useful, Promise-wrapped functions for common browser extension APIs (e.g., `browser.tabs`, `browser.runtime`, `browser.storage`).

This file is designed to be copied directly into your browser extension project. It has no external dependencies and works natively in your background or content scripts.

### How to use `browser.js`

1. Copy `browser.js` from the `webext-schema` repository into your extension's source directory.
2. Import the needed functions into your extension scripts:

```javascript
import { createTab, getActiveTab, setStorage } from './path/to/browser.js';

// Example: Create a new tab and save data
async function openAndSave() {
  const tab = await createTab({ url: '[https://example.com](https://example.com)' });
  await setStorage({ lastOpenedTabId: tab.id }, 'local');
}
```
