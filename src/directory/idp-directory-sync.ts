import type { Tenant } from "../core/tenant.js";
import type { ISessionManager } from "../authn/session-manager.js";
import { AuditEvent, AuditEventKind } from "../provider/audit-sink.js";
import type { IAuditSink } from "../provider/audit-sink.js";
import type { ISecurityModelConfig } from "../security/security-model-config.js";
import { IdpUserState } from "./idp-directory-snapshot.js";
import type { IdpDirectorySnapshot } from "./idp-directory-snapshot.js";
import { IdpDirectoryRequest } from "./idp-directory-source.js";
import type { IIdpDirectorySource } from "./idp-directory-source.js";
import { UnreadableIdpDirectoryRecordError } from "./idp-directory-store.js";
import type { IIdpDirectoryStore } from "./idp-directory-store.js";

export class IdpDirectorySyncResult
{
    public constructor(
        public readonly Snapshot: IdpDirectorySnapshot,
        public readonly Deprovisioned: readonly string[],
    )
    {
    }
}

/** Pulls a directory snapshot, stores it, revokes sessions of newly deprovisioned identities and audits the counts.
 *  Scheduling (poll vs push, frequency) is the host's choice. */
export class IdpDirectorySync
{
    private static readonly UsersKey = "users";
    private static readonly GroupsKey = "groups";
    private static readonly DeprovisionedKey = "deprovisioned";

    public constructor(
        private readonly source: IIdpDirectorySource,
        private readonly store: IIdpDirectoryStore,
        private readonly sessions: ISessionManager,
        private readonly audit: IAuditSink,
        private readonly now: () => Date = () => new Date(),
    )
    {
    }

    public async Run(tenant: Tenant, config: ISecurityModelConfig): Promise<IdpDirectorySyncResult>
    {
        const snapshot = await this.source.Snapshot(tenant, IdpDirectoryRequest.For(config));
        const previous = await this.Previous(tenant.Id);
        const deprovisioned: string[] = [];
        for (const [principalId, state] of snapshot.Users())
        {
            if (!IdpDirectorySync.IsGone(state)) continue;
            const before = previous?.StateOf(principalId) ?? IdpUserState.Unknown;
            if (!IdpDirectorySync.IsGone(before)) deprovisioned.push(principalId);
        }
        for (const principalId of deprovisioned) await this.sessions.RevokeAllFor(tenant, principalId);
        await this.store.Save(tenant.Id, snapshot);
        const detail = new Map<string, string>([
            [IdpDirectorySync.UsersKey, String(snapshot.Users().size)],
            [IdpDirectorySync.GroupsKey, String(snapshot.Groups().size)],
            [IdpDirectorySync.DeprovisionedKey, String(deprovisioned.length)],
        ]);
        await this.audit.Record(new AuditEvent(AuditEventKind.DirectorySync, tenant.Id, null, this.now(), detail));
        return new IdpDirectorySyncResult(snapshot, deprovisioned);
    }

    /** An unreadable stored record counts as none: every gone identity is revoked again (idempotent) and the Save replaces it. */
    private async Previous(tenantId: string): Promise<IdpDirectorySnapshot | null>
    {
        try
        {
            return await this.store.Get(tenantId);
        }
        catch (e)
        {
            if (e instanceof UnreadableIdpDirectoryRecordError) return null;
            throw e;
        }
    }

    private static IsGone(state: IdpUserState): boolean
    {
        return state === IdpUserState.Disabled || state === IdpUserState.Deleted;
    }
}
