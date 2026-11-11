import type { Principal } from "../core/principal.js";
import { PrincipalKind } from "../core/identity-enums.js";

export enum IdpUserState
{
    Enabled = "enabled",
    Disabled = "disabled",
    Deleted = "deleted",
    Unknown = "unknown",
}

/** A point-in-time view of the IdP directory: user states and group membership. */
export class IdpDirectorySnapshot
{
    private readonly users: ReadonlyMap<string, IdpUserState>;
    private readonly groups: ReadonlyMap<string, readonly string[]>;

    public constructor(
        public readonly TakenAt: Date,
        public readonly Authoritative: boolean,
        users: ReadonlyMap<string, IdpUserState>,
        groups: ReadonlyMap<string, readonly string[]>,
    )
    {
        this.users = new Map(users);
        const copy = new Map<string, readonly string[]>();
        for (const [k, v] of groups) copy.set(k, [...v]);
        this.groups = copy;
    }

    public static NonAuthoritative(at: Date): IdpDirectorySnapshot
    {
        return new IdpDirectorySnapshot(at, false, new Map(), new Map());
    }

    public StateOf(principalId: string): IdpUserState
    {
        return this.users.get(principalId) ?? IdpUserState.Unknown;
    }

    public MembersOf(groupId: string): readonly string[]
    {
        return this.groups.get(groupId) ?? [];
    }

    public IsActive(principal: Principal): boolean
    {
        if (principal.Kind !== PrincipalKind.User) return true;
        return this.IsStateActive(principal.Id);
    }

    /** True unless the IdP records the user as Disabled or Deleted (unknown counts as active). */
    public IsStateActive(principalId: string): boolean
    {
        const state = this.StateOf(principalId);
        return state !== IdpUserState.Disabled && state !== IdpUserState.Deleted;
    }

    public Users(): ReadonlyMap<string, IdpUserState>
    {
        return this.users;
    }

    public Groups(): ReadonlyMap<string, readonly string[]>
    {
        return this.groups;
    }
}
