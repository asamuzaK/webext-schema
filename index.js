/**
 * index.js
 */
"use strict";
/* api */
const {Schema} = require("./modules/schema");
const {logErr, throwErr} = require("./modules/common");
const {updateSchemas} = require("./modules/update");
const {version} = require("./package.json");
const commander = require("commander");
const process = require("process");

/* commands */
commander.version(version, "-v, --version");
commander.command("update").alias("u").description("update schemas")
  .option("-c, --channel <name>", "specify the release channel")
  .option("-i, --info", "console info")
  .action(updateSchemas);
commander.parse(process.argv);

/* process */
process.on("uncaughtException", throwErr);
process.on("unhandledRejection", logErr);

module.exports = {
  Schema,
};
