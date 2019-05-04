/**
 * schema-test.js
 */
"use strict";
const {Schema} = require("../../modules/schema");

const schema = new Schema();

schema.getAll({module: "sinon-chrome"}).then(res => {
  console.log(res);
});
