import { test } from "node:test";
import assert from "node:assert/strict";
import { LocalAccount } from "../local-account-store.js";
import { ServiceTokenGrant } from "../service-token-store.js";

test("LocalAccount carries its readonly fields", () =>
{
    const account = new LocalAccount("p1", "t1", "a@x.io", "t1/pwhash/p1", false);
    assert.equal(account.PrincipalId, "p1");
    assert.equal(account.Email, "a@x.io");
    assert.equal(account.SecretRef, "t1/pwhash/p1");
});

test("ServiceTokenGrant carries scopes and nullable expiry", () =>
{
    const grant = new ServiceTokenGrant("t1/tok/k1", "svc1", "t1", ["read:models"], null);
    assert.equal(grant.TokenRef, "t1/tok/k1");
    assert.deepEqual(grant.Scopes, ["read:models"]);
    assert.equal(grant.ExpiresAt, null);
});
