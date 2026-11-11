import type { Tenant } from "../core/tenant.js";

export class LocalGroup
{
    public constructor(
        public readonly GroupId: string,
        public readonly TenantId: string,
        public readonly Name: string,
        public readonly MemberIds: readonly string[])
    {
    }
}

export class LocalGroupNotFoundError extends Error
{
    private static readonly MessagePrefix = "local group not found: ";

    public constructor(public readonly GroupId: string)
    {
        super(LocalGroupNotFoundError.MessagePrefix + GroupId);
        this.name = "LocalGroupNotFoundError";
    }
}

export interface ILocalGroupStore
{
    CreateGroup(tenant: Tenant, groupId: string, name: string): Promise<LocalGroup>;
    DeleteGroup(tenant: Tenant, groupId: string): Promise<void>;
    AddMember(tenant: Tenant, groupId: string, principalId: string): Promise<void>;
    RemoveMember(tenant: Tenant, groupId: string, principalId: string): Promise<void>;
    ListGroups(tenant: Tenant): Promise<readonly LocalGroup[]>;
}
