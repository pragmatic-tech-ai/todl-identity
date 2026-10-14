import { test } from "node:test";
import assert from "node:assert/strict";
import { PrivilegeAction, AccessLevel } from "../security-model-config.js";
import type { ISecurityModelConfig } from "../security-model-config.js";

test("PrivilegeAction and AccessLevel serialize to their tokens", () =>
{
    assert.equal(PrivilegeAction.Create, "create");
    assert.equal(PrivilegeAction.AppendTo, "appendTo");
    assert.equal(AccessLevel.BusinessUnitAndChildren, "businessUnitAndChildren");
    assert.equal(JSON.parse(JSON.stringify({ a: PrivilegeAction.Read, l: AccessLevel.Organization })).l, "organization");
});

test("ISecurityModelConfig carries optional roles and roleAssignment", () =>
{
    const withRoles: ISecurityModelConfig =
    {
        businessUnits: [{ id: "root", name: "Root" }],
        teams: [],
        membership: { claimsMapping: [], overrides: [] },
        ownershipRules: [],
        roles: [{ id: "reader", name: "Reader", privileges: [{ action: PrivilegeAction.Read, concept: "shop.Order", level: AccessLevel.User }] }],
        roleAssignment: { claimsMapping: [], overrides: [], teamRoles: [] },
    };
    assert.equal(withRoles.roles?.[0].id, "reader");

    const withoutRoles: ISecurityModelConfig =
    {
        businessUnits: [{ id: "root", name: "Root" }],
        teams: [],
        membership: { claimsMapping: [], overrides: [] },
        ownershipRules: [],
    };
    assert.equal(withoutRoles.roles, undefined);
    assert.equal(withoutRoles.roleAssignment, undefined);
});
