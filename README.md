[![Build Status](https://travis-ci.org/asamuzaK/webext-schema.svg?branch=master)](https://travis-ci.org/asamuzaK/webext-schema)

# webext-schema

WebExtensions schemas fetched from hg.mozilla.org

WIP
Not published to npm yet.

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
Release channel defaults to "release".

If you want to specify a particular channel, pass it as an argument when creating the instance.

```
const schema = new Schema("beta");
```

Or set it afterwards.

```
const schema = new Schema();
schema.channel = "beta";
```

### schema.list()

Async function to get the list of schema files.
Returns an array.

```
const schema = new Schema();
schema.list().then(res => {
  console.log(res); // ["alarms.json", "bookmarks.json", ...]
});
```

### schema.get(<var>file</var>)

Async function to get the schema for a specific API.
Argument can be either a file name or an API name.
Returns an array.

```
const schema = new Schema();
schema.get("browser_action.json").then(res => {
  console.log(res); // [{namespace: "browserAction", events: [...], ...}]
});
```

```
const schema = new Schema();
schema.get("browserAction").then(res => {
  console.log(res); // [{namespace: "browserAction", events: [...], ...}]
});
```

### schema.getAll()

Async function to get all schemas as a single object.
Returns an object.
Note that the key of the object is the file name and the value is the scheme.

```
const schema = new Schema();
schema.getAll().then(res => {
  console.log(res); // {"alarms.json": [{...}], "bookmarks.json": [{...}], ...}
});
```
