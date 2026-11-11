import { test } from "node:test";
import assert from "node:assert/strict";
import { PerUserSourceTokenCache } from "../per-user-source-token-cache.js";
import { PresentedSecret } from "../presented-secret.js";
import { SourceToken, SourceTokenError, SourceTokenFailure, SourceTokenRequest } from "../source-token-provider.js";

const Resource = "https://database.windows.net/.default";

class Tokens
{
    public static readonly Now = new Date("2026-01-01T00:00:00Z");

    public static Make(secret: string, ttlMs: number): SourceToken
    {
        return new SourceToken(Resource, new PresentedSecret(secret), new Date(Tokens.Now.getTime() + ttlMs));
    }
}

test("cache never serves one principal's token to another", () =>
{
    const cache = new PerUserSourceTokenCache();
    const token = Tokens.Make("alice-secret", 3_600_000);
    cache.Put(new SourceTokenRequest("t", "alice", Resource), token);
    assert.equal(cache.Get(new SourceTokenRequest("t", "bob", Resource), Tokens.Now), undefined);
    assert.equal(cache.Get(new SourceTokenRequest("t2", "alice", Resource), Tokens.Now), undefined);
    assert.equal(cache.Get(new SourceTokenRequest("t", "alice", Resource), Tokens.Now), token);
});

test("a token inside the skew window is a miss", () =>
{
    const cache = new PerUserSourceTokenCache();
    const request = new SourceTokenRequest("t", "alice", Resource);
    cache.Put(request, Tokens.Make("s", 30_000));
    assert.equal(cache.Get(request, Tokens.Now), undefined);
});

test("Forget drops every resource of that principal only", () =>
{
    const cache = new PerUserSourceTokenCache();
    const a1 = new SourceTokenRequest("t", "alice", "r1");
    const a2 = new SourceTokenRequest("t", "alice", "r2");
    const b1 = new SourceTokenRequest("t", "bob", "r1");
    cache.Put(a1, Tokens.Make("s", 3_600_000));
    cache.Put(a2, Tokens.Make("s", 3_600_000));
    cache.Put(b1, Tokens.Make("s", 3_600_000));
    cache.Forget("t", "alice");
    assert.equal(cache.Get(a1, Tokens.Now), undefined);
    assert.equal(cache.Get(a2, Tokens.Now), undefined);
    assert.notEqual(cache.Get(b1, Tokens.Now), undefined);
});

test("SourceTokenError carries its failure and no secret", () =>
{
    const secret = "super-secret-token-text";
    const token = Tokens.Make(secret, 1000);
    const error = new SourceTokenError(SourceTokenFailure.ExchangeRejected);
    assert.equal(error.Failure, SourceTokenFailure.ExchangeRejected);
    assert.equal(error.message, "the upstream token exchange was rejected");
    assert.ok(!error.message.includes(token.Value.Reveal()));
});
