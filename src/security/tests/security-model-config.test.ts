import { test } from "node:test";
import assert from "node:assert/strict";
import { OwnershipSourceKind } from "../security-model-config.js";
import type { ISecurityModelConfig } from "../security-model-config.js";
import { IdentityConfig } from "../../provider/identity-config.js";
import { DelegationDepth } from "../../core/identity-enums.js";

test("OwnershipSourceKind serializes to its author-friendly token", () =>
{
    assert.equal(OwnershipSourceKind.Fixed, "fixed");
    assert.equal(OwnershipSourceKind.FromField, "fromField");
    assert.equal(JSON.parse(JSON.stringify({ k: OwnershipSourceKind.Fixed })).k, "fixed");
});

test("IdentityConfig carries an optional SecurityModel", () =>
{
    const model: ISecurityModelConfig =
    {
        businessUnits: [{ id: "root", name: "Root" }],
        teams: [],
        membership: { claimsMapping: [], overrides: [] },
        ownershipRules: [],
    };
    const withModel = new IdentityConfig("pack", DelegationDepth.AuthnDirectory, new Map(), new Map(), new Map(), model);
    assert.equal(withModel.SecurityModel, model);
    const without = new IdentityConfig("pack", DelegationDepth.AuthnDirectory, new Map(), new Map(), new Map());
    assert.equal(without.SecurityModel, undefined);
});
