import { test } from "node:test";
import assert from "node:assert/strict";
import { AccessDecision } from "../access-decision.js";
import type { EntityPredicate, EntityView } from "../entity-predicate.js";

test("Deny is closed with no filter", () =>
{
    const d = AccessDecision.Deny("no grant");
    assert.equal(d.Allowed, false);
    assert.equal(d.Reason, "no grant");
    assert.equal(d.EntityFilter, undefined);
});

test("Allow carries an optional entity filter", () =>
{
    const everything: EntityPredicate =
    {
        Matches: (_e: EntityView) => true,
    };
    const open = AccessDecision.Allow("role grant");
    const filtered = AccessDecision.Allow("role grant", everything);
    assert.equal(open.Allowed, true);
    assert.equal(open.EntityFilter, undefined);
    assert.equal(filtered.Allowed, true);
    assert.equal(filtered.EntityFilter, everything);
});
