import { test } from "node:test";
import assert from "node:assert/strict";
import { PrivilegeAction } from "../security-model-config.js";
import { BaseRole } from "../base-role.js";

test("PrivilegeAction carries invoke and keeps every existing token", () =>
{
    assert.deepEqual(Object.values(PrivilegeAction), ["create", "read", "update", "delete", "append", "appendTo", "assign", "share", "invoke"]);
});
test("BaseRole values equal their names", () =>
{
    assert.deepEqual(Object.entries(BaseRole).map(([k, v]) => k === v), [true, true, true]);
    assert.deepEqual(Object.values(BaseRole), ["SystemAdministrator", "BasicUser", "Reader"]);
});
