import { test } from "node:test";
import assert from "node:assert/strict";
import { Principal } from "../principal.js";
import { PrincipalKind } from "../identity-enums.js";
import { SystemPrincipal } from "../system-principal.js";

test("system principal is per environment, System kind, no groups", () =>
{
    const p = SystemPrincipal.For("env-1");
    assert.equal(p.Id, "system:env-1");
    assert.equal(p.TenantId, "env-1");
    assert.equal(p.Kind, PrincipalKind.System);
    assert.deepEqual(p.Groups, []);
    assert.equal(SystemPrincipal.Is(p), true);
    assert.equal(SystemPrincipal.Is(new Principal("system:env-1", "env-1", PrincipalKind.User, new Map(), [])), false);
});
test("SystemPrincipal.For rejects an empty environment id", () =>
{
    assert.throws(() => SystemPrincipal.For(""));
});
