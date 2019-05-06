[![Build Status](https://travis-ci.org/asamuzaK/webext-schema.svg?branch=master)](https://travis-ci.org/asamuzaK/webext-schema)
[![dependencies Status](https://david-dm.org/asamuzaK/webext-schema/status.svg)](https://david-dm.org/asamuzaK/webext-schema)
[![devDependencies Status](https://david-dm.org/asamuzaK/webext-schema/dev-status.svg)](https://david-dm.org/asamuzaK/webext-schema?type=dev)

# webext-schema

WebExtensions schemas fetched from hg.mozilla.org

NOTE: Still unstable.

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

Schemas for "release", "beta", "central" are available.
Release channel defaults to "beta".

If you want to specify a particular channel, pass one of the three channels as an argument when creating the instance.

```
const schema = new Schema("central");
```

Or you can set it afterwards.

```
const schema = new Schema();
schema.channel = "central";
```

### schema.arrange(<var>opt</var>)

* @param {Object} opt - options
* @param {string} opt.name - application name

Get the arranged schema for the specific application.

```
const schema = (new Schema()).arrange({name: "sinon-chrome"});
// [{namespace: "alarms", functions: [{...}], ...}];
```

### schema.get(<var>name</var>)

* @param {string} name - API name or file name

Get the schema for a specific API.
Argument can be either an API name or a file name.
Returns an array.

```
const schema = (new Schema()).get("browserAction");
// [{namespace: "browserAction", events: [...], ...}]
```

```
const schema = (new Schema()).get("browser_action.json");
// [{namespace: "browserAction", events: [...], ...}]
```

### schema.getAll()

Get all schemas as a single object.
Returns an object containing all schemas.
Note that the key of the object is the file name and the value is the schema.

```
const schema = (new Schema()).getAll();
// {"alarms.json": [{...}], "bookmarks.json": [{...}], ...}
```

### schema.list()

Get the list of schema files.
Returns an array.

```
const list = (new Schema()).list();
// ["alarms.json", "bookmarks.json", ...]
```
