import type { ISecurityModelConfig, ITeamConfig } from "../security/security-model-config.js";
import type { Principal } from "../core/principal.js";
import { PrincipalKind } from "../core/identity-enums.js";
import { IdpDirectorySnapshot, IdpUserState } from "./idp-directory-snapshot.js";

export enum MembershipOrigin
{
    Synced = "synced",
    Manual = "manual",
}

export class TeamMembershipRow
{
    public constructor(
        public readonly TeamId: string,
        public readonly PrincipalId: string,
        public readonly Origin: MembershipOrigin,
    )
    {
    }
}

/** Team membership as the union of IdP-synced rows and manual rows, minus inactive identities. */
export class TeamMembershipRows
{
    private static readonly OriginRank: Readonly<Record<MembershipOrigin, number>> =
    {
        [MembershipOrigin.Synced]: 0,
        [MembershipOrigin.Manual]: 1,
    };

    private constructor(
        private readonly teams: readonly ITeamConfig[],
        private readonly snapshot: IdpDirectorySnapshot,
    )
    {
    }

    public static For(config: ISecurityModelConfig, snapshot: IdpDirectorySnapshot): TeamMembershipRows
    {
        return new TeamMembershipRows(config.teams, snapshot);
    }

    public Rows(teamId: string): readonly TeamMembershipRow[]
    {
        const team = this.teams.find(t => t.id === teamId);
        if (!team) return [];
        const rows: TeamMembershipRow[] = [];
        if (this.snapshot.Authoritative)
        {
            for (const group of team.idpGroups)
            {
                for (const id of this.snapshot.MembersOf(group)) rows.push(new TeamMembershipRow(teamId, id, MembershipOrigin.Synced));
            }
        }
        for (const id of team.manualMembers) rows.push(new TeamMembershipRow(teamId, id, MembershipOrigin.Manual));
        return rows
            .filter(r => this.IsActiveId(r.PrincipalId))
            .filter((r, i, all) => all.findIndex(o => o.PrincipalId === r.PrincipalId && o.Origin === r.Origin) === i)
            .sort((a, b) => TeamMembershipRows.Compare(a, b));
    }

    public TeamsOf(principal: Principal): readonly string[]
    {
        if (principal.Kind === PrincipalKind.System || !this.snapshot.IsActive(principal)) return [];
        const result: string[] = [];
        for (const team of this.teams)
        {
            const manual = team.manualMembers.includes(principal.Id);
            const synced = this.snapshot.Authoritative
                ? team.idpGroups.some(g => this.snapshot.MembersOf(g).includes(principal.Id))
                : team.idpGroups.some(g => principal.Groups.includes(g));
            if ((manual || synced) && !result.includes(team.id)) result.push(team.id);
        }
        return result.sort();
    }

    private IsActiveId(principalId: string): boolean
    {
        const state = this.snapshot.StateOf(principalId);
        return state !== IdpUserState.Disabled && state !== IdpUserState.Deleted;
    }

    private static Compare(a: TeamMembershipRow, b: TeamMembershipRow): number
    {
        if (a.PrincipalId !== b.PrincipalId) return a.PrincipalId < b.PrincipalId ? -1 : 1;
        return TeamMembershipRows.OriginRank[a.Origin] - TeamMembershipRows.OriginRank[b.Origin];
    }
}
