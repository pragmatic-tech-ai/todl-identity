import { test } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { PresentedSecret } from "../presented-secret.js";

test("PresentedSecret reveals its value until cleared", () =>
{
    const secret = new PresentedSecret("hunter2");
    assert.equal(secret.Reveal(), "hunter2");
    secret.Clear();
    assert.throws(() => secret.Reveal());
});

test("PresentedSecret redacts under string and JSON coercion", () =>
{
    const secret = new PresentedSecret("hunter2");
    assert.ok(!`${secret}`.includes("hunter2"));
    assert.ok(!String(secret).includes("hunter2"));
    assert.ok(!JSON.stringify({ secret }).includes("hunter2"));
});

test("PresentedSecret does not leak via inspection or enumeration", () =>
{
    const secret = new PresentedSecret("hunter2");
    assert.ok(!inspect(secret).includes("hunter2"));
    assert.ok(!JSON.stringify(Object.keys(secret)).includes("hunter2"));
    assert.ok(!JSON.stringify({ ...secret }).includes("hunter2"));
});

test("PresentedSecret cleared error does not contain the value", () =>
{
    const secret = new PresentedSecret("hunter2");
    secret.Clear();
    try
    {
        secret.Reveal();
        assert.fail("expected throw");
    }
    catch (err)
    {
        assert.ok(!String(err).includes("hunter2"));
    }
});
