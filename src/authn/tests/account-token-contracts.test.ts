import { test } from "node:test";
import assert from "node:assert/strict";
import { LocalAccount, LocalAccountNotFoundError } from "../local-account-store.js";
import { ServiceTokenSummary } from "../service-token-store.js";

test("LocalAccount carries the Disabled flag as its last field", () =>
{
    const account = new LocalAccount("p", "t", "e", "r", false);
    assert.equal(account.Disabled, false);
    assert.equal(new LocalAccount("p", "t", "e", "r", true).Disabled, true);
});

test("LocalAccountNotFoundError carries the principal id", () =>
{
    const error = new LocalAccountNotFoundError("p1");
    assert.ok(error instanceof Error);
    assert.equal(error.PrincipalId, "p1");
    assert.equal(error.name, "LocalAccountNotFoundError");
});

test("ServiceTokenSummary carries its readonly fields", () =>
{
    const summary = new ServiceTokenSummary("t/svctok/h", "p", ["read"], null, true);
    assert.equal(summary.TokenRef, "t/svctok/h");
    assert.equal(summary.PrincipalId, "p");
    assert.deepEqual(summary.Scopes, ["read"]);
    assert.equal(summary.ExpiresAt, null);
    assert.equal(summary.Revoked, true);
});
