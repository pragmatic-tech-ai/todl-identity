import type { Realm } from "../core/realm.js";

export class LocalGroup
{
    public constructor(
        public readonly GroupId: string,
        public readonly RealmId: string,
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
    CreateGroup(realm: Realm, groupId: string, name: string): Promise<LocalGroup>;
    DeleteGroup(realm: Realm, groupId: string): Promise<void>;
    AddMember(realm: Realm, groupId: string, principalId: string): Promise<void>;
    RemoveMember(realm: Realm, groupId: string, principalId: string): Promise<void>;
    ListGroups(realm: Realm): Promise<readonly LocalGroup[]>;
}
