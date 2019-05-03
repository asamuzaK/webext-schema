"use strict";
/* api */
const {assert} = require("chai");
const {describe, it} = require("mocha");
const {isString} = require("../modules/common");

/* constant */
const {
  CHAR, DIR_HOME, INDENT, IS_BE, IS_LE, IS_MAC, IS_WIN,
} = require("../modules/constant");

describe("string constants", () => {
  it("should get string", () => {
    const arr = [
      CHAR,
      DIR_HOME,
    ];
    arr.forEach(i => {
      assert.isTrue(isString(i));
    });
  });
});

describe("number constants", () => {
  it("should get number", () => {
    const arr = [INDENT];
    arr.forEach(i => {
      assert.isTrue(typeof i === "number");
    });
  });
});

describe("boolean constants", () => {
  it("should get boolean", () => {
    const arr = [
      IS_BE,
      IS_LE,
      IS_MAC,
      IS_WIN,
    ];
    arr.forEach(i => {
      assert.isTrue(typeof i === "boolean");
    });
  });
});
