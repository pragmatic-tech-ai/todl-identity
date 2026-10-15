import { test } from "node:test";
import assert from "node:assert/strict";
import type { ISecurityModelConfig, IFieldSecurityConfig } from "../../index.js";

test("fieldSecurity section is assignable to ISecurityModelConfig", () =>
{
    const fs: IFieldSecurityConfig =
    {
        securedFields: [{ concept: "shop.Widget", field: "cost" }],
        profiles: [{ id: "p1", name: "Cost Readers", grants: [{ concept: "shop.Widget", field: "cost", read: true }] }],
        profileAssignment: { claimsMapping: [{ claim: "r", value: "cost", profiles: ["p1"] }], overrides: [], teamProfiles: [] },
    };
    const model: ISecurityModelConfig =
    {
        businessUnits: [{ id: "root", name: "Root" }],
        teams: [], membership: { claimsMapping: [], overrides: [] }, ownershipRules: [],
        fieldSecurity: fs,
    };
    assert.equal(model.fieldSecurity?.profiles[0].grants[0].read, true);
});
