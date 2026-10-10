import { test } from "node:test";
import assert from "node:assert/strict";
import { Role, Action } from "../../core/identity-enums.js";
import { RoleCapabilities } from "../role-capabilities.js";

test("role capability boundaries", () =>
{
    assert.equal(RoleCapabilities.Covers(Role.Viewer, Action.Read), true);
    assert.equal(RoleCapabilities.Covers(Role.Viewer, Action.Write), false);
    assert.equal(RoleCapabilities.Covers(Role.Editor, Action.Write), true);
    assert.equal(RoleCapabilities.Covers(Role.Editor, Action.Delete), false);
    assert.equal(RoleCapabilities.Covers(Role.Admin, Action.Administer), true);
    assert.equal(RoleCapabilities.Covers(Role.Admin, Action.Connect), false);
    assert.equal(RoleCapabilities.Covers(Role.Owner, Action.Connect), true);
});
