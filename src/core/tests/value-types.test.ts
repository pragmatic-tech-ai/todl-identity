import { test } from "node:test";
import assert from "node:assert/strict";
import { TenantKind, PrincipalKind, Role, Action, AuthMethod } from "../identity-enums.js";
import { Tenant } from "../tenant.js";
import { Principal } from "../principal.js";
import { Session } from "../session.js";

test("Tenant.IsSelfHosted reflects kind", () =>
{
    assert.equal(new Tenant("t1", TenantKind.SelfHosted, "Local").IsSelfHosted(), true);
    assert.equal(new Tenant("t2", TenantKind.Saas, "Acme").IsSelfHosted(), false);
});

test("Principal group and claim lookup", () =>
{
    const p = new Principal("p1", "t1", PrincipalKind.User, new Map([["region", "eu"]]), ["crm-editors"]);
    assert.equal(p.HasGroup("crm-editors"), true);
    assert.equal(p.HasGroup("admins"), false);
    assert.equal(p.Claim("region"), "eu");
    assert.equal(p.Claim("missing"), undefined);
});

test("Session expiry is inclusive at the boundary", () =>
{
    const issued = new Date(1000);
    const expires = new Date(2000);
    const s = new Session("s1", "p1", "t1", issued, expires, AuthMethod.Local);
    assert.equal(s.IsExpired(new Date(1999)), false);
    assert.equal(s.IsExpired(new Date(2000)), true);
    assert.equal(s.IsExpired(new Date(2001)), true);
});

test("Role and Action enums are real enums", () =>
{
    assert.equal(Role[Role.Owner], "Owner");
    assert.equal(Action[Action.Administer], "Administer");
});
