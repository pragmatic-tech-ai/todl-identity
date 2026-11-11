import { test } from "node:test";
import assert from "node:assert/strict";
import { AccessLevel, PrivilegeAction } from "../security-model-config.js";
import type { ISecurityModelConfig } from "../security-model-config.js";
import { InvalidSecurityModelError, SecurityModelIssueCode, SecurityModelValidator } from "../security-model-validator.js";

class ValidatorFx
{
    public static Valid(): ISecurityModelConfig
    {
        return {
            businessUnits: [
                { id: "contoso", name: "Contoso" },
                { id: "sales", name: "Sales", parent: "contoso" },
                { id: "hr", name: "HR", parent: "contoso" },
            ],
            users: [{ principalId: "dana", businessUnitId: "hr" }],
            teams: [{ id: "hr", name: "HR", businessUnitId: "hr", idpGroups: ["hr-staff"], manualMembers: ["dana"] }],
            roleAssignments: [],
            profileAssignments: [],
            roleOverrides: [],
            profileOverrides: [],
        };
    }

    public static With(patch: Record<string, unknown>): ISecurityModelConfig
    {
        return { ...ValidatorFx.Valid(), ...patch } as unknown as ISecurityModelConfig;
    }

    public static Summary(config: ISecurityModelConfig): { Code: string; Path: string }[]
    {
        return SecurityModelValidator.Validate(config).map(i => ({ Code: i.Code, Path: i.Path }));
    }

    public static Codes(config: ISecurityModelConfig): string[]
    {
        return SecurityModelValidator.Validate(config).map(i => i.Code);
    }

    public static RoleOverride(): Record<string, unknown>
    {
        return { role: "BasicUser", concept: "Order", action: PrivilegeAction.Read, level: AccessLevel.User };
    }

    public static ProfileOverride(): Record<string, unknown>
    {
        return { profile: "pii", concept: "Order", field: "ssn", read: true, update: false, create: false };
    }
}

test("a valid model has no issues", () =>
{
    assert.deepEqual(SecurityModelValidator.Validate(ValidatorFx.Valid()), []);
});

test("retired sections are rejected by name", () =>
{
    for (const name of ["ownershipRules", "roles", "roleAssignment", "fieldSecurity", "membership"])
    {
        assert.deepEqual(ValidatorFx.Summary(ValidatorFx.With({ [name]: [] })), [{ Code: SecurityModelIssueCode.UnknownSection, Path: name }]);
    }
});

test("a second root is a malformed tree", () =>
{
    const bus = [...ValidatorFx.Valid().businessUnits, { id: "other", name: "Other" }];
    assert.deepEqual(ValidatorFx.Summary(ValidatorFx.With({ businessUnits: bus })), [{ Code: SecurityModelIssueCode.MalformedBusinessUnitTree, Path: "businessUnits" }]);
});

test("references must resolve", () =>
{
    const user = ValidatorFx.With({ users: [{ principalId: "dana", businessUnitId: "nope" }] });
    assert.deepEqual(ValidatorFx.Summary(user), [{ Code: SecurityModelIssueCode.UnknownBusinessUnit, Path: "users[0].businessUnitId" }]);
    const team = ValidatorFx.With({ teams: [{ id: "hr", name: "HR", businessUnitId: "nope", idpGroups: [], manualMembers: [] }] });
    assert.deepEqual(ValidatorFx.Summary(team), [{ Code: SecurityModelIssueCode.UnknownBusinessUnit, Path: "teams[0].businessUnitId" }]);
    const role = ValidatorFx.With({ roleAssignments: [{ role: "BasicUser", principalIds: [], teamIds: ["ghost"] }] });
    assert.deepEqual(ValidatorFx.Summary(role), [{ Code: SecurityModelIssueCode.UnknownTeam, Path: "roleAssignments[0].teamIds[0]" }]);
});

test("duplicates are rejected", () =>
{
    const dana = { principalId: "dana", businessUnitId: "hr" };
    assert.deepEqual(ValidatorFx.Codes(ValidatorFx.With({ users: [dana, dana] })), [SecurityModelIssueCode.DuplicateUser]);
    const team = ValidatorFx.Valid().teams[0];
    assert.deepEqual(ValidatorFx.Codes(ValidatorFx.With({ teams: [team, team] })), [SecurityModelIssueCode.DuplicateTeam]);
    const ra = { role: "BasicUser", principalIds: [], teamIds: [] };
    assert.deepEqual(ValidatorFx.Codes(ValidatorFx.With({ roleAssignments: [ra, ra] })), [SecurityModelIssueCode.DuplicateEntry]);
    const ro = ValidatorFx.RoleOverride();
    assert.deepEqual(ValidatorFx.Codes(ValidatorFx.With({ roleOverrides: [ro, ro] })), [SecurityModelIssueCode.DuplicateOverride]);
    const po = ValidatorFx.ProfileOverride();
    assert.deepEqual(ValidatorFx.Codes(ValidatorFx.With({ profileOverrides: [po, po] })), [SecurityModelIssueCode.DuplicateOverride]);
});

test("override vocabulary is checked", () =>
{
    const action = ValidatorFx.With({ roleOverrides: [{ ...ValidatorFx.RoleOverride(), action: "write" }] });
    assert.deepEqual(ValidatorFx.Summary(action), [{ Code: SecurityModelIssueCode.UnknownAction, Path: "roleOverrides[0].action" }]);
    const level = ValidatorFx.With({ roleOverrides: [{ ...ValidatorFx.RoleOverride(), level: "global" }] });
    assert.deepEqual(ValidatorFx.Summary(level), [{ Code: SecurityModelIssueCode.UnknownLevel, Path: "roleOverrides[0].level" }]);
});

test("empty ids are rejected", () =>
{
    const team = ValidatorFx.With({ teams: [{ id: "", name: "HR", businessUnitId: "hr", idpGroups: [], manualMembers: [] }] });
    assert.ok(ValidatorFx.Codes(team).includes(SecurityModelIssueCode.EmptyId));
    const member = ValidatorFx.With({ teams: [{ id: "hr", name: "HR", businessUnitId: "hr", idpGroups: [], manualMembers: [""] }] });
    assert.deepEqual(ValidatorFx.Summary(member), [{ Code: SecurityModelIssueCode.EmptyId, Path: "teams[0].manualMembers[0]" }]);
    const user = ValidatorFx.With({ users: [{ principalId: "", businessUnitId: "hr" }] });
    assert.deepEqual(ValidatorFx.Summary(user), [{ Code: SecurityModelIssueCode.EmptyId, Path: "users[0].principalId" }]);
});

test("AssertValid throws with every issue", () =>
{
    const bad = ValidatorFx.With({ users: [{ principalId: "dana", businessUnitId: "nope" }], ownershipRules: [] });
    assert.throws(() => SecurityModelValidator.AssertValid(bad), (e: unknown) => e instanceof InvalidSecurityModelError && e.Issues.length === 2);
});
