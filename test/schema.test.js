"use strict";
/* api */
const {
  Schema,
} = require("../modules/schema");
const {assert} = require("chai");
const {describe, it} = require("mocha");

describe("Schema", () => {
  it("should be instance of Schema", () => {
    const schema = new Schema();
    assert.instanceOf(schema, Schema);
  });

  it("should get value", () => {
    const schema = new Schema();
    assert.strictEqual(schema.channel, "release");
  });

  it("should get value", () => {
    const schema = new Schema("foo");
    assert.strictEqual(schema.channel, "release");
  });

  it("should get value", () => {
    const schema = new Schema("beta");
    assert.strictEqual(schema.channel, "beta");
  });

  it("should get value", () => {
    const schema = new Schema("central");
    assert.strictEqual(schema.channel, "central");
  });

  it("should set value", () => {
    const schema = new Schema();
    schema.channel = true;
    assert.strictEqual(schema.channel, "release");
  });

  it("should set value", () => {
    const schema = new Schema();
    schema.channel = "foo";
    assert.strictEqual(schema.channel, "release");
  });

  it("should set value", () => {
    const schema = new Schema();
    schema.channel = "beta";
    assert.strictEqual(schema.channel, "beta");
  });

  it("should set value", () => {
    const schema = new Schema();
    schema.channel = "central";
    assert.strictEqual(schema.channel, "central");
  });

  it("should set value", () => {
    const schema = new Schema("beta");
    schema.channel = "release";
    assert.strictEqual(schema.channel, "release");
  });

  it("should get object", async () => {
    const schema = new Schema();
    const res = await schema._getSchema();
    assert.isObject(res, "result");
    const keys = Object.keys(res);
    for (const key of keys) {
      assert.isTrue(key.endsWith(".json"), "key");
    }
  });

  it("should get object", async () => {
    const schema = new Schema("release");
    const res = await schema._getSchema();
    assert.isObject(res, "result");
    const keys = Object.keys(res);
    for (const key of keys) {
      assert.isTrue(key.endsWith(".json"), "key");
    }
  });

  it("should get object", async () => {
    const schema = new Schema("beta");
    const res = await schema._getSchema();
    assert.isObject(res, "result");
    const keys = Object.keys(res);
    for (const key of keys) {
      assert.isTrue(key.endsWith(".json"), "key");
    }
  });

  it("should get object", async () => {
    const schema = new Schema("central");
    const res = await schema._getSchema();
    assert.isObject(res, "result");
    const keys = Object.keys(res);
    for (const key of keys) {
      assert.isTrue(key.endsWith(".json"), "key");
    }
  });

  it("should get array", async () => {
    const schema = new Schema();
    const res = await schema.list();
    assert.isArray(res, "result");
    for (const key of res) {
      assert.isTrue(key.endsWith(".json"), "key");
    }
  });

  it("should get array", async () => {
    const schema = new Schema("release");
    const res = await schema.list();
    assert.isArray(res, "result");
    for (const key of res) {
      assert.isTrue(key.endsWith(".json"), "key");
    }
  });

  it("should get array", async () => {
    const schema = new Schema("beta");
    const res = await schema.list();
    assert.isArray(res, "result");
    for (const key of res) {
      assert.isTrue(key.endsWith(".json"), "key");
    }
  });

  it("should get array", async () => {
    const schema = new Schema("central");
    const res = await schema.list();
    assert.isArray(res, "result");
    for (const key of res) {
      assert.isTrue(key.endsWith(".json"), "key");
    }
  });

  it("should throw", async () => {
    const schema = new Schema();
    await schema.get().catch(e => {
      assert.instanceOf(e, TypeError, "error");
      assert.strictEqual(e.message, "Expected String but got Undefined.");
    });
  });

  it("should get null", async () => {
    const schema = new Schema();
    const res = await schema.get("foo");
    assert.isNull(res, "result");
  });

  it("should get array", async () => {
    const schema = new Schema();
    const res = await schema.get("browser_action.json");
    assert.isArray(res, "result");
  });

  it("should get array", async () => {
    const schema = new Schema();
    const res = await schema.get("browser_action");
    assert.isArray(res, "result");
  });

  it("should get array", async () => {
    const schema = new Schema();
    const res = await schema.get("browserAction");
    assert.isArray(res, "result");
  });

  it("should get object", async () => {
    const schema = new Schema();
    const res = await schema.getAll();
    assert.isObject(res, "result");
    const keys = Object.keys(res);
    for (const key of keys) {
      assert.isTrue(key.endsWith(".json"), "key");
    }
  });

  it("should get array", async () => {
    const schema = new Schema();
    const res = await schema.getAll({module: "sinon-chrome"});
    assert.isArray(res, "result");
  });
});
