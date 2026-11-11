import type { Tenant } from "../core/tenant.js";
import type { ISecurityModelConfig } from "../security/security-model-config.js";
import type { IdpDirectorySnapshot } from "./idp-directory-snapshot.js";

/** What the sync asks the IdP about: the linked groups and every principal the security model names. */
export class IdpDirectoryRequest
{
    public constructor(
        public readonly GroupIds: readonly string[],
        public readonly PrincipalIds: readonly string[],
    )
    {
    }

    public static For(config: ISecurityModelConfig): IdpDirectoryRequest
    {
        const groups = new Set<string>();
        const principals = new Set<string>();
        for (const user of config.users) principals.add(user.principalId);
        for (const team of config.teams)
        {
            for (const g of team.idpGroups) groups.add(g);
            for (const m of team.manualMembers) principals.add(m);
        }
        for (const a of config.roleAssignments)
        {
            for (const p of a.principalIds) principals.add(p);
        }
        for (const a of config.profileAssignments)
        {
            for (const p of a.principalIds) principals.add(p);
        }
        return new IdpDirectoryRequest([...groups].sort(), [...principals].sort());
    }
}

export interface IIdpDirectorySource
{
    readonly Authoritative: boolean;
    Snapshot(tenant: Tenant, request: IdpDirectoryRequest): Promise<IdpDirectorySnapshot>;
}
