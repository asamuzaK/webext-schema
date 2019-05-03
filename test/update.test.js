/* eslint-disable no-magic-numbers */
"use strict";
const {
  createUnifiedSchema, fetchText, getAllSchemaData, getChannelUrl, getFileList,
  getSchemaData, saveSchemaFile, updateSchemas,
} = require("../modules/update");
const {assert} = require("chai");
const {describe, it} = require("mocha");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const process = require("process");
const sinon = require("sinon");

describe("fetch text", () => {
  it("should throw", async () => {
    await fetchText().catch(e => {
      assert.instanceOf(e, TypeError, "error");
      assert.strictEqual(e.message, "Expected String but got Undefined.");
    });
  });

  it("should throw", async () => {
    const stubFetch = sinon.stub(fetch, "Promise").resolves({});
    await fetchText("https://example.com").catch(e => {
      assert.instanceOf(e, Error, "error");
      assert.strictEqual(e.message,
                         "Network response was not ok. status: undefined");
    });
    stubFetch.restore();
  });

  it("should throw", async () => {
    const stubFetch = sinon.stub(fetch, "Promise").resolves({
      ok: false,
      status: 404,
    });
    await fetchText("https://example.com").catch(e => {
      assert.instanceOf(e, Error, "error");
      assert.strictEqual(e.message,
                         "Network response was not ok. status: 404");
    });
    stubFetch.restore();
  });

  it("should get result", async () => {
    const stubFetch = sinon.stub(fetch, "Promise").resolves({
      ok: true,
      status: 200,
      text: () => "foo",
    });
    const res = await fetchText("https://example.com");
    stubFetch.restore();
    assert.strictEqual(res, "foo", "result");
  });
});

describe("get channel url", () => {
  it("should get result", () => {
    const res = getChannelUrl();
    assert.strictEqual(
      res, "https://hg.mozilla.org/releases/mozilla-release/raw-file/tip/",
      "result"
    );
  });

  it("should get result", () => {
    const res = getChannelUrl("release");
    assert.strictEqual(
      res, "https://hg.mozilla.org/releases/mozilla-release/raw-file/tip/",
      "result"
    );
  });

  it("should get result", () => {
    const res = getChannelUrl("beta");
    assert.strictEqual(
      res, "https://hg.mozilla.org/releases/mozilla-beta/raw-file/tip/",
      "result"
    );
  });

  it("should get result", () => {
    const res = getChannelUrl("central");
    assert.strictEqual(
      res, "https://hg.mozilla.org/mozilla-central/raw-file/tip/",
      "result"
    );
  });
});

describe("get schema file list from jar manifest", () => {
  it("should throw", async () => {
    await getFileList().catch(e => {
      assert.instanceOf(e, TypeError, "error");
      assert.strictEqual(e.message, "Expected String but got Undefined.");
    });
  });

  it("should get array", async () => {
    const stubFetch = sinon.stub(fetch, "Promise").resolves({
      ok: true,
      status: 200,
      text: () => "# comment\n\ntoolkit.jar:\n% content extensions %content/extensions/\n    content/extensions/schemas/alarms.json\n    content/extensions/schemas/browser_settings.json\n#ifndef ANDROID\n    content/extensions/schemas/geckoProfiler.json\n#endif\n    content/extensions/schemas/i18n.json\n",
    });
    const res = await getFileList("https://example.com");
    stubFetch.restore();
    assert.deepEqual(res, [
      "alarms.json",
      "browser_settings.json",
      "geckoProfiler.json",
      "i18n.json",
    ], "result");
  });
});

describe("get schema data", () => {
  it("should throw", async () => {
    await getSchemaData().catch(e => {
      assert.instanceOf(e, TypeError, "error");
      assert.strictEqual(e.message, "Expected String but got Undefined.");
    });
  });

  it("should throw", async () => {
    await getSchemaData("foo").catch(e => {
      assert.instanceOf(e, TypeError, "error");
      assert.strictEqual(e.message, "Expected String but got Undefined.");
    });
  });

  it("should get object", async () => {
    const stubFetch = sinon.stub(fetch, "Promise").resolves({
      ok: true,
      status: 200,
      text: () => "{\"foo\": [\"bar\"]}\n",
    });
    const res = await getSchemaData("foo.json", "https://example.com");
    stubFetch.restore();
    assert.deepEqual(res, {
      file: "foo.json",
      schema: {
        foo: ["bar"],
      },
    }, "result");
  });
});

describe("get all schema data", () => {
  it("should throw", async () => {
    await getAllSchemaData().catch(e => {
      assert.instanceOf(e, TypeError, "error");
      assert.strictEqual(e.message, "Expected String but got Undefined.");
    });
  });

  it("should get array", async () => {
    const stubFetch = sinon.stub(fetch, "Promise");
    stubFetch.onCall(0).resolves({
      ok: true,
      status: 200,
      text: () => "content/extensions/schemas/foo.json\ncontent/extensions/schemas/bar.json\n",
    });
    stubFetch.onCall(1).resolves({
      ok: true,
      status: 200,
      text: () => "{\"foo\": \"foobar\"}",
    });
    stubFetch.onCall(2).resolves({
      ok: true,
      status: 200,
      text: () => "{\"baz\": \"qux\"}",
    });
    const res = await getAllSchemaData("https://example.com/");
    stubFetch.restore();
    assert.deepEqual(res, [
      {
        file: "foo.json",
        schema: {
          foo: "foobar",
        },
      },
      {
        file: "bar.json",
        schema: {
          baz: "qux",
        },
      },
    ], "result");
  });
});

describe("create unified schema", () => {
  it("should get object", async () => {
    const stubAll = sinon.stub(Promise, "all").resolves([
      [
        {
          file: "foo",
          schema: {
            foo: "bar",
          },
        },
      ],
      [
        {
          file: "baz",
          schema: {
            baz: "qux",
          },
        },
      ],
    ]);
    const res = await createUnifiedSchema();
    stubAll.restore();
    assert.deepEqual(res, {
      foo: {
        foo: "bar",
      },
      baz: {
        baz: "qux",
      },
    }, "result");
  });
});

describe("save schema file", () => {
  it("should throw", async () => {
    await saveSchemaFile().catch(e => {
      assert.instanceOf(e, TypeError, "error");
      assert.strictEqual(e.message, "Expected String but got Undefined.");
    });
  });

  it("should create file", async () => {
    const stubAll = sinon.stub(Promise, "all").resolves([
      [
        {
          file: "foo",
          schema: {
            foo: "bar",
          },
        },
      ],
      [
        {
          file: "baz",
          schema: {
            baz: "qux",
          },
        },
      ],
    ]);
    const stubWrite = sinon.stub(fs.promises, "writeFile");
    const stubInfo = sinon.stub(console, "info");
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath = path.join(process.cwd(), "schemas", "release", "all.json");
    const res = await saveSchemaFile("release");
    const {callCount: writeCallCount} = stubWrite;
    const {callCount: infoCallCount} = stubInfo;
    stubInfo.restore();
    stubAll.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, "write");
    assert.strictEqual(infoCallCount, j, "info");
    assert.strictEqual(res, filePath, "result");
  });

  it("should create file", async () => {
    const stubAll = sinon.stub(Promise, "all").resolves([
      [
        {
          file: "foo",
          schema: {
            foo: "bar",
          },
        },
      ],
      [
        {
          file: "baz",
          schema: {
            baz: "qux",
          },
        },
      ],
    ]);
    const stubWrite = sinon.stub(fs.promises, "writeFile");
    const stubInfo = sinon.stub(console, "info");
    const i = stubWrite.callCount;
    const j = stubInfo.callCount;
    const filePath = path.join(process.cwd(), "schemas", "release", "all.json");
    const res = await saveSchemaFile("release", true);
    const {callCount: writeCallCount} = stubWrite;
    const {callCount: infoCallCount} = stubInfo;
    stubInfo.restore();
    stubAll.restore();
    stubWrite.restore();
    assert.strictEqual(writeCallCount, i + 1, "write");
    assert.strictEqual(infoCallCount, j + 1, "info");
    assert.strictEqual(res, filePath, "result");
  });
});

describe("update schemas files", () => {
  it("should get result", async () => {
    const stubAll = sinon.stub(Promise, "all").callsFake(async arr => {
      let val;
      switch (arr.length) {
        case 2:
          val = [
            [
              {
                file: "foo",
                schema: {
                  foo: "bar",
                },
              },
            ],
            [
              {
                file: "baz",
                schema: {
                  baz: "qux",
                },
              },
            ],
          ];
          break;
        default:
          val = arr.length;
      }
      return val;
    });
    const stubWrite = sinon.stub(fs.promises, "writeFile");
    const res = await updateSchemas();
    stubWrite.restore();
    stubAll.restore();
    assert.strictEqual(res, 3, "result");
  });

  it("should get result", async () => {
    const stubAll = sinon.stub(Promise, "all").callsFake(async arr => {
      let val;
      switch (arr.length) {
        case 2:
          val = [
            [
              {
                file: "foo",
                schema: {
                  foo: "bar",
                },
              },
            ],
            [
              {
                file: "baz",
                schema: {
                  baz: "qux",
                },
              },
            ],
          ];
          break;
        default:
          val = arr.length;
      }
      return val;
    });
    const stubWrite = sinon.stub(fs.promises, "writeFile");
    const res = await updateSchemas({channel: "release"});
    stubWrite.restore();
    stubAll.restore();
    assert.strictEqual(res, 1, "result");
  });
});
