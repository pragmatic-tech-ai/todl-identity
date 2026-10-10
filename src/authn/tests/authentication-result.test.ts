import { test } from "node:test";
import assert from "node:assert/strict";
import { PrincipalKind, AuthMethod } from "../../core/identity-enums.js";
import { Principal } from "../../core/principal.js";
import {
    AuthenticationOutcome,
    AuthenticatedResult,
    ChallengeResult,
    RejectedResult,
} from "../authentication-result.js";
import { Credential } from "../credential.js";

test("results carry a discriminating outcome", () =>
{
    const p = new Principal("p1", "t1", PrincipalKind.User, new Map(), []);
    assert.equal(new AuthenticatedResult(p).Outcome, AuthenticationOutcome.Authenticated);
    assert.equal(new ChallengeResult("mfa").Outcome, AuthenticationOutcome.Challenge);
    assert.equal(new RejectedResult("bad credential").Outcome, AuthenticationOutcome.Rejected);
});

test("authenticated result exposes the principal", () =>
{
    const p = new Principal("p1", "t1", PrincipalKind.User, new Map(), []);
    const r = new AuthenticatedResult(p);
    assert.equal(r.Principal.Id, "p1");
});

test("credential references a secret, never holds one", () =>
{
    const c = new Credential(AuthMethod.Local, "secret-store://local/p1");
    assert.equal(c.Method, AuthMethod.Local);
    assert.equal(c.Reference, "secret-store://local/p1");
});
