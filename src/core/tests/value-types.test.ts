import { test } from "node:test";
import assert from "node:assert/strict";
import { RealmKind, PrincipalKind, Role, Action, AuthMethod, ResourceKind } from "../identity-enums.js";
import { Realm } from "../realm.js";
import { Principal } from "../principal.js";
import { Session } from "../session.js";

test("Realm.IsSelfHosted reflects kind", () =>
{
    assert.equal(new Realm("t1", RealmKind.SelfHosted, "Local").IsSelfHosted(), true);
    assert.equal(new Realm("t2", RealmKind.Saas, "Acme").IsSelfHosted(), false);
});

test("ResourceKind.Realm keeps the stored value 0 (it was ResourceKind.Tenant)", () =>
{
    assert.equal(ResourceKind.Realm, 0);
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
