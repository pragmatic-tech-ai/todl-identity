import { test } from "node:test";
import assert from "node:assert/strict";
import { ServiceKey } from "@pragmatic-tech-ai/todl-runtime";

test("todl-runtime dependency resolves", () =>
{
    const key = new ServiceKey<string>("Probe");
    assert.ok(key instanceof ServiceKey);
});
