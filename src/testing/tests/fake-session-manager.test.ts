import { test } from "node:test";
import assert from "node:assert/strict";
import { PrincipalKind, TenantKind } from "../../core/identity-enums.js";
import { Principal } from "../../core/principal.js";
import { Tenant } from "../../core/tenant.js";
import { FakeSessionManager } from "../fakes.js";

test("FakeSessionManager.RevokeAllFor drops only the matching principal's sessions", async () =>
{
    const sessions = new FakeSessionManager();
    const a1 = await sessions.Issue(new Principal("a", "t1", PrincipalKind.User, new Map(), []));
    const a2 = await sessions.Issue(new Principal("a", "t1", PrincipalKind.User, new Map(), []));
    const b1 = await sessions.Issue(new Principal("b", "t1", PrincipalKind.User, new Map(), []));
    const otherTenant = await sessions.Issue(new Principal("a", "t2", PrincipalKind.User, new Map(), []));
    await sessions.RevokeAllFor(new Tenant("t1", TenantKind.Saas, "Acme"), "a");
    assert.equal(await sessions.Validate(a1.Id), null);
    assert.equal(await sessions.Validate(a2.Id), null);
    assert.equal((await sessions.Validate(b1.Id))?.Id, b1.Id);
    assert.equal((await sessions.Validate(otherTenant.Id))?.Id, otherTenant.Id);
});
