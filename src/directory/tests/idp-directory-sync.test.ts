import { test } from "node:test";
import assert from "node:assert/strict";
import type { ISecurityModelConfig } from "../../security/security-model-config.js";
import { Tenant } from "../../core/tenant.js";
import { AuditEventKind } from "../../provider/audit-sink.js";
import { IdpDirectorySnapshot, IdpUserState } from "../idp-directory-snapshot.js";
import type { IIdpDirectorySource } from "../idp-directory-source.js";
import { IdpDirectoryRequest } from "../idp-directory-source.js";
import type { IIdpDirectoryStore } from "../idp-directory-store.js";
import { IdpDirectorySync } from "../idp-directory-sync.js";
import { FakeAuditSink, FakeIdpDirectorySource, FakeSessionManager, FakeTenant } from "../../testing/fakes.js";

class MapStore implements IIdpDirectoryStore
{
    private readonly map = new Map<string, IdpDirectorySnapshot>();

    public async Get(tenantId: string): Promise<IdpDirectorySnapshot | null>
    {
        return this.map.get(tenantId) ?? null;
    }

    public async Save(tenantId: string, snapshot: IdpDirectorySnapshot): Promise<void>
    {
        this.map.set(tenantId, snapshot);
    }
}

class ThrowingSource implements IIdpDirectorySource
{
    public readonly Authoritative = true;

    public async Snapshot(): Promise<IdpDirectorySnapshot>
    {
        throw new Error("idp down");
    }
}

class RecordingSessions extends FakeSessionManager
{
    public readonly Revoked: string[] = [];
    public FailRevoke = false;

    public override async RevokeAllFor(tenant: Tenant, principalId: string): Promise<void>
    {
        if (this.FailRevoke) throw new Error("revoke down");
        this.Revoked.push(principalId);
        await super.RevokeAllFor(tenant, principalId);
    }
}

class Fixture
{
    public static Config(): ISecurityModelConfig
    {
        return {
            businessUnits: [],
            users: [{ principalId: "zed", businessUnitId: "root" }, { principalId: "alice", businessUnitId: "root" }],
            teams: [
                { id: "hr", name: "HR", businessUnitId: "root", idpGroups: ["hr-staff", "all"], manualMembers: ["dana"] },
                { id: "ops", name: "Ops", businessUnitId: "root", idpGroups: ["all"], manualMembers: ["alice"] },
            ],
            roleAssignments: [{ role: "r", principalIds: ["bob"], teamIds: [] }],
            profileAssignments: [{ profile: "p", principalIds: ["carol", "bob"], teamIds: [] }],
            roleOverrides: [],
            profileOverrides: [],
        } as unknown as ISecurityModelConfig;
    }

    public static Snapshot(dana: IdpUserState): IdpDirectorySnapshot
    {
        return new IdpDirectorySnapshot(new Date(1), true, new Map([["dana", dana], ["alice", IdpUserState.Enabled]]), new Map([["hr-staff", ["dana"]]]));
    }
}

test("request covers linked groups and every referenced principal", () =>
{
    const request = IdpDirectoryRequest.For(Fixture.Config());
    assert.deepEqual(request.GroupIds, ["all", "hr-staff"]);
    assert.deepEqual(request.PrincipalIds, ["alice", "bob", "carol", "dana", "zed"]);
});

test("sync saves the snapshot and audits one DirectorySync event", async () =>
{
    const tenant = FakeTenant.Saas();
    const snapshot = Fixture.Snapshot(IdpUserState.Enabled);
    const source = new FakeIdpDirectorySource(snapshot);
    const store = new MapStore();
    const audit = new FakeAuditSink();
    const sync = new IdpDirectorySync(source, store, new FakeSessionManager(), audit, () => new Date(5));
    await sync.Run(tenant, Fixture.Config());
    assert.equal(await store.Get(tenant.Id), snapshot);
    assert.equal(audit.Events.length, 1);
    const event = audit.Events[0];
    assert.equal(event.Kind, AuditEventKind.DirectorySync);
    assert.deepEqual([...event.Detail.entries()].sort(), [["deprovisioned", "0"], ["groups", "1"], ["users", "2"]]);
    assert.ok(!JSON.stringify([...event.Detail.values()]).includes("dana"));
});

test("sync revokes sessions of newly deprovisioned identities", async () =>
{
    const tenant = FakeTenant.Saas();
    const store = new MapStore();
    await store.Save(tenant.Id, Fixture.Snapshot(IdpUserState.Enabled));
    const sessions = new RecordingSessions();
    const source = new FakeIdpDirectorySource(Fixture.Snapshot(IdpUserState.Disabled));
    const sync = new IdpDirectorySync(source, store, sessions, new FakeAuditSink());
    const first = await sync.Run(tenant, Fixture.Config());
    assert.deepEqual(first.Deprovisioned, ["dana"]);
    assert.deepEqual(sessions.Revoked, ["dana"]);
    const second = await sync.Run(tenant, Fixture.Config());
    assert.deepEqual(second.Deprovisioned, []);
    assert.deepEqual(sessions.Revoked, ["dana"]);
});

test("a failing source leaves the stored snapshot untouched and rethrows", async () =>
{
    const tenant = FakeTenant.Saas();
    const store = new MapStore();
    const previous = Fixture.Snapshot(IdpUserState.Enabled);
    await store.Save(tenant.Id, previous);
    const sync = new IdpDirectorySync(new ThrowingSource(), store, new FakeSessionManager(), new FakeAuditSink());
    await assert.rejects(() => sync.Run(tenant, Fixture.Config()), /idp down/);
    assert.equal(await store.Get(tenant.Id), previous);
});

test("a failing revocation leaves the stored snapshot untouched so the next run retries", async () =>
{
    const tenant = FakeTenant.Saas();
    const store = new MapStore();
    const previous = Fixture.Snapshot(IdpUserState.Enabled);
    await store.Save(tenant.Id, previous);
    const sessions = new RecordingSessions();
    sessions.FailRevoke = true;
    const sync = new IdpDirectorySync(new FakeIdpDirectorySource(Fixture.Snapshot(IdpUserState.Disabled)), store, sessions, new FakeAuditSink());
    await assert.rejects(() => sync.Run(tenant, Fixture.Config()), /revoke down/);
    assert.equal(await store.Get(tenant.Id), previous);
});
