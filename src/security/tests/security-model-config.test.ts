import { test } from "node:test";
import assert from "node:assert/strict";
import { AccessLevel, PrivilegeAction } from "../security-model-config.js";
import type { ISecurityModelConfig } from "../security-model-config.js";
import { IdentityConfig } from "../../provider/identity-config.js";
import { DelegationDepth } from "../../core/identity-enums.js";

test("IdentityConfig carries an optional SecurityModel", () =>
{
    const model: ISecurityModelConfig =
    {
        businessUnits: [{ id: "root", name: "Root" }],
        users: [{ principalId: "dana", businessUnitId: "root" }],
        teams: [{ id: "hr", name: "HR", businessUnitId: "root", idpGroups: ["hr-staff"], manualMembers: ["dana"] }],
        roleAssignments: [{ role: "BasicUser", principalIds: ["dana"], teamIds: ["hr"] }],
        profileAssignments: [{ profile: "pii", principalIds: [], teamIds: ["hr"] }],
        roleOverrides: [{ role: "BasicUser", concept: "Order", action: PrivilegeAction.Read, level: AccessLevel.BusinessUnit }],
        profileOverrides: [{ profile: "pii", concept: "Order", field: "ssn", read: true, update: false, create: false }],
    };
    const withModel = new IdentityConfig("pack", DelegationDepth.AuthnDirectory, new Map(), new Map(), new Map(), model);
    assert.equal(withModel.SecurityModel, model);
    assert.deepEqual(JSON.parse(JSON.stringify(withModel.SecurityModel)), JSON.parse(JSON.stringify(model)));
    const without = new IdentityConfig("pack", DelegationDepth.AuthnDirectory, new Map(), new Map(), new Map());
    assert.equal(without.SecurityModel, undefined);
});
