[![build](https://github.com/asamuzaK/webext-schema/workflows/build/badge.svg)](https://github.com/asamuzaK/webext-schema/actions?query=workflow%3Abuild)
[![CodeQL](https://github.com/asamuzaK/webext-schema/workflows/CodeQL/badge.svg)](https://github.com/asamuzaK/webext-schema/actions?query=workflow%3ACodeQL)
[![npm](https://img.shields.io/npm/v/webext-schema)](https://www.npmjs.com/package/webext-schema)

# webext-schema

[WebExtentions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions "Browser Extensions - Mozilla | MDN") schemas and [MailExtensions](https://developer.thunderbird.net/add-ons/mailextensions "A Guide to Extensions - Thunderbird") schemas fetched from [hg.mozilla.org](https://hg.mozilla.org/).
Stubbed browser API is also available.

## Install

```
npm i webext-schema
```

## Usage

```
import { Schema } from 'webext-schema';

const schema = new Schema();
```

### new Schema(<var>channel</var>, <var>sinonConfig</var>)

* @param {string} [channel] - release channel. one of "beta", "central", "release", "esr", "mail".
* @param {Object} [sinonConfig] - optional configuration for `sinon.createSandbox()`, see [Sinon.JS](https://sinonjs.org/) for details.

Both arguments are optional.

```
const schema = new Schema("central", {
  useFakeTimers: true,
  useFakeServer: true,
});
```

### schema.channel

"central", "beta", "release", "esr" for WebExtensions, and "mail" for MailExtensions are available.
Channel defaults to "beta".

```
const schema = new Schema("central");
```

Also, you can set it afterwards.

```
const schema = new Schema();
schema.channel = "central";
```

### schema.get(<var>name</var>)

* @param {string} name - API name or file name
* @returns {?Array} - schema

Get the schema for the specific API.
Argument can be either an API name or a file name.

```
const schema = new Schema().get("browserAction");
// [{namespace: "browserAction", events: [...], ...}]
```

```
const schema = new Schema().get("browser_action.json");
// [{namespace: "browserAction", events: [...], ...}]
```

### schema.getAll()

* @returns {Object} - all schemas

Get all schemas as a single object.
Note that the key of the object is the file name and the value is the schema.

```
const schema = new Schema().getAll();
// {"alarms.json": [{...}], "bookmarks.json": [{...}], ...}
```

### schema.list()

* @returns {Array} - file names

Get the list of schema files.

```
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

```
const browser = new Schema().mock();

// example of mocking runtime.connect()
const mockConnect = browser.runtime.connect.callsFake(({name}) => {
  const port = Object.assign({}, browser.runtime.Port);
  port.name = name;
  return port;
});

const port1 = mockConnect({name: "foo"});
const port2 = mockConnect({name: "bar"});
assert.strictEqual(port1.name, "foo");
assert.isFunction(port1.onDisconnect.addListener);
assert.strictEqual(port2.name, "bar");
assert.isFunction(port2.onDisconnect.addListener);

// reset
browser._sandbox.reset();
```
