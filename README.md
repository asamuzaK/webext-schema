[![Build Status](https://travis-ci.org/asamuzaK/webext-schema.svg?branch=master)](https://travis-ci.org/asamuzaK/webext-schema)
[![dependencies Status](https://david-dm.org/asamuzaK/webext-schema/status.svg)](https://david-dm.org/asamuzaK/webext-schema)
[![devDependencies Status](https://david-dm.org/asamuzaK/webext-schema/dev-status.svg)](https://david-dm.org/asamuzaK/webext-schema?type=dev)
[![npm version](https://badge.fury.io/js/webext-schema.svg)](https://badge.fury.io/js/webext-schema)

# webext-schema

WebExtensions schemas and MailExtension schemas fetched from hg.mozilla.org

## Install

```
npm i webext-schema
```

## Usage

```
const {Schema} = require("webext-schema");

const schema = new Schema();
```

### schema.channel

Channel defaults to "beta".
"central", "beta", "release" for WebExtensions, and "mail" for MailExtensions are available.

```
const schema = new Schema("central");
```

Also, you can set it afterwards.

```
const schema = new Schema();
schema.channel = "central";
```

### schema.arrange(<var>opt</var>)

* @param {Object} opt - options
* @param {string} opt.name - application name
* @returns {*} - arranged schema

Get the arranged schema for the specific application.

Supported applications:

* [sinon-chrome](https://www.npmjs.com/package/sinon-chrome)

```
const schema = new Schema().arrange({name: "sinon-chrome"});
// [{namespace: "alarms", functions: [{...}], ...}];
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
