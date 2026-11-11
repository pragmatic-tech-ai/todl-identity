import { test } from "node:test";
import assert from "node:assert/strict";
import type { ISecurityModelConfig } from "../../security/security-model-config.js";
import { Principal } from "../../core/principal.js";
import { PrincipalKind } from "../../core/identity-enums.js";
import { SystemPrincipal } from "../../core/system-principal.js";
import { IdpDirectorySnapshot, IdpUserState } from "../idp-directory-snapshot.js";
import { MembershipOrigin, TeamMembershipRow, TeamMembershipRows } from "../team-membership-rows.js";

class Fixture
{
    public static Config(): ISecurityModelConfig
    {
        return {
            businessUnits: [{ id: "root", name: "Root" }],
            teams: [
                { id: "hr", name: "HR", businessUnitId: "root", idpGroups: ["hr-staff"], manualMembers: ["dana"] },
                { id: "managers", name: "Managers", businessUnitId: "root", idpGroups: ["mgr"], manualMembers: [] },
            ],
        } as unknown as ISecurityModelConfig;
    }

    public static User(id: string, groups: string[] = []): Principal
    {
        return new Principal(id, "env", PrincipalKind.User, new Map(), groups);
    }

    public static Snapshot(hrStaff: string[], danaState: IdpUserState = IdpUserState.Enabled): IdpDirectorySnapshot
    {
        const users = new Map<string, IdpUserState>([
            ["alice", IdpUserState.Enabled],
            ["dana", danaState],
        ]);
        return new IdpDirectorySnapshot(new Date(), true, users, new Map([["hr-staff", hrStaff]]));
    }
}

test("synced rows come from linked groups and manual rows from manualMembers", () =>
{
    const rows = TeamMembershipRows.For(Fixture.Config(), Fixture.Snapshot(["alice", "dana"]));
    assert.deepEqual(rows.Rows("hr"), [
        new TeamMembershipRow("hr", "alice", MembershipOrigin.Synced),
        new TeamMembershipRow("hr", "dana", MembershipOrigin.Synced),
        new TeamMembershipRow("hr", "dana", MembershipOrigin.Manual),
    ]);
});

test("removed from the IdP group keeps the manual row", () =>
{
    const rows = TeamMembershipRows.For(Fixture.Config(), Fixture.Snapshot(["alice"]));
    assert.deepEqual(rows.TeamsOf(Fixture.User("dana")), ["hr"]);
    const dana = rows.Rows("hr").filter(r => r.PrincipalId === "dana");
    assert.equal(dana.length, 1);
    assert.equal(dana[0].Origin, MembershipOrigin.Manual);
});

test("disabled or deleted identity loses manual and synced membership", () =>
{
    for (const state of [IdpUserState.Disabled, IdpUserState.Deleted])
    {
        const rows = TeamMembershipRows.For(Fixture.Config(), Fixture.Snapshot(["alice", "dana"], state));
        assert.deepEqual(rows.TeamsOf(Fixture.User("dana")), []);
        assert.equal(rows.Rows("hr").some(r => r.PrincipalId === "dana"), false);
    }
});

test("non-authoritative snapshot takes synced rows from token groups and treats unknown users as active", () =>
{
    const snapshot = IdpDirectorySnapshot.NonAuthoritative(new Date());
    const rows = TeamMembershipRows.For(Fixture.Config(), snapshot);
    const bob = Fixture.User("bob", ["mgr"]);
    assert.deepEqual(rows.TeamsOf(bob), ["managers"]);
    assert.equal(snapshot.IsActive(bob), true);
    assert.deepEqual(rows.Rows("managers"), []);
});

test("system principal is active and in no team", () =>
{
    const snapshot = IdpDirectorySnapshot.NonAuthoritative(new Date());
    const rows = TeamMembershipRows.For(Fixture.Config(), snapshot);
    const system = SystemPrincipal.For("env");
    assert.deepEqual(rows.TeamsOf(system), []);
    assert.equal(snapshot.IsActive(system), true);
});
