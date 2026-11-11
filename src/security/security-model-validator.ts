import { BusinessUnitHierarchy, MalformedBusinessUnitTreeError } from "./business-unit-hierarchy.js";
import { AccessLevel, PrivilegeAction } from "./security-model-config.js";
import type { ISecurityModelConfig } from "./security-model-config.js";

export enum SecurityModelIssueCode
{
    MalformedBusinessUnitTree = "malformedBusinessUnitTree",
    UnknownSection = "unknownSection",
    EmptyId = "emptyId",
    DuplicateUser = "duplicateUser",
    DuplicateTeam = "duplicateTeam",
    UnknownBusinessUnit = "unknownBusinessUnit",
    UnknownTeam = "unknownTeam",
    DuplicateEntry = "duplicateEntry",
    UnknownAction = "unknownAction",
    UnknownLevel = "unknownLevel",
    DuplicateOverride = "duplicateOverride",
}

export class SecurityModelIssue
{
    public constructor(
        public readonly Code: SecurityModelIssueCode,
        public readonly Path: string,
        public readonly Message: string)
    {
    }
}

export class InvalidSecurityModelError extends Error
{
    private static readonly PathSeparator = ": ";
    private static readonly IssueSeparator = "; ";

    public constructor(public readonly Issues: readonly SecurityModelIssue[])
    {
        super(InvalidSecurityModelError.Describe(Issues));
        this.name = new.target.name;
    }

    private static Describe(issues: readonly SecurityModelIssue[]): string
    {
        return issues.map(i => i.Path + InvalidSecurityModelError.PathSeparator + i.Message).join(InvalidSecurityModelError.IssueSeparator);
    }
}

interface IAssignmentView
{
    readonly name: string;
    readonly principalIds: readonly string[];
    readonly teamIds: readonly string[];
}

export class SecurityModelValidator
{
    private static readonly Sections: ReadonlySet<string> = new Set([
        "businessUnits", "users", "teams", "roleAssignments", "profileAssignments", "roleOverrides", "profileOverrides",
    ]);
    private static readonly BusinessUnitsPath = "businessUnits";
    private static readonly UsersPath = "users";
    private static readonly TeamsPath = "teams";
    private static readonly RoleAssignmentsPath = "roleAssignments";
    private static readonly ProfileAssignmentsPath = "profileAssignments";
    private static readonly RoleOverridesPath = "roleOverrides";
    private static readonly ProfileOverridesPath = "profileOverrides";
    private static readonly PrincipalIdSuffix = ".principalId";
    private static readonly BusinessUnitIdSuffix = ".businessUnitId";
    private static readonly IdSuffix = ".id";
    private static readonly IdpGroupsSuffix = ".idpGroups";
    private static readonly ManualMembersSuffix = ".manualMembers";
    private static readonly PrincipalIdsSuffix = ".principalIds";
    private static readonly TeamIdsSuffix = ".teamIds";
    private static readonly ActionSuffix = ".action";
    private static readonly LevelSuffix = ".level";
    private static readonly KeySeparator = "\u0000";
    private static readonly IndexOpen = "[";
    private static readonly IndexClose = "]";
    private static readonly DisplaySeparator = "/";
    private static readonly UnknownSectionMessage = "unknown security-model section";
    private static readonly EmptyIdMessage = "id must not be empty";
    private static readonly DuplicateUserMessage = "user is placed more than once: ";
    private static readonly DuplicateTeamMessage = "team id is duplicated: ";
    private static readonly UnknownBusinessUnitMessage = "unknown business unit: ";
    private static readonly UnknownTeamMessage = "unknown team: ";
    private static readonly DuplicateRoleMessage = "role is assigned more than once: ";
    private static readonly DuplicateProfileMessage = "profile is assigned more than once: ";
    private static readonly UnknownActionMessage = "unknown privilege action: ";
    private static readonly UnknownLevelMessage = "unknown access level: ";
    private static readonly DuplicateOverrideMessage = "override is duplicated: ";

    private readonly issues: SecurityModelIssue[] = [];

    private constructor(private readonly config: ISecurityModelConfig)
    {
    }

    public static Validate(config: ISecurityModelConfig): readonly SecurityModelIssue[]
    {
        const validator = new SecurityModelValidator(config);
        validator.Run();
        return validator.issues;
    }

    public static AssertValid(config: ISecurityModelConfig): void
    {
        const issues = SecurityModelValidator.Validate(config);
        if (issues.length > 0)
        {
            throw new InvalidSecurityModelError(issues);
        }
    }

    private static Index(section: string, i: number): string
    {
        return section + SecurityModelValidator.IndexOpen + i + SecurityModelValidator.IndexClose;
    }

    private Run(): void
    {
        for (const key of Object.keys(this.config))
        {
            if (!SecurityModelValidator.Sections.has(key))
            {
                this.Add(SecurityModelIssueCode.UnknownSection, key, SecurityModelValidator.UnknownSectionMessage);
            }
        }
        const hierarchy = this.BuildHierarchy();
        this.CheckUsers(hierarchy);
        const teamIds = this.CheckTeams(hierarchy);
        const roles: IAssignmentView[] = this.config.roleAssignments.map(a => ({ name: a.role, principalIds: a.principalIds, teamIds: a.teamIds }));
        const profiles: IAssignmentView[] = this.config.profileAssignments.map(a => ({ name: a.profile, principalIds: a.principalIds, teamIds: a.teamIds }));
        this.CheckAssignments(SecurityModelValidator.RoleAssignmentsPath, roles, teamIds, SecurityModelValidator.DuplicateRoleMessage);
        this.CheckAssignments(SecurityModelValidator.ProfileAssignmentsPath, profiles, teamIds, SecurityModelValidator.DuplicateProfileMessage);
        this.CheckRoleOverrides();
        this.CheckProfileOverrides();
    }

    private Add(code: SecurityModelIssueCode, path: string, message: string): void
    {
        this.issues.push(new SecurityModelIssue(code, path, message));
    }

    private BuildHierarchy(): BusinessUnitHierarchy | undefined
    {
        try
        {
            return BusinessUnitHierarchy.FromConfig(this.config.businessUnits);
        }
        catch (e)
        {
            if (e instanceof MalformedBusinessUnitTreeError)
            {
                this.Add(SecurityModelIssueCode.MalformedBusinessUnitTree, SecurityModelValidator.BusinessUnitsPath, e.message);
                return undefined;
            }
            throw e;
        }
    }

    // Returns true when the key was already present; records it otherwise.
    private Seen(seen: Set<string>, key: string): boolean
    {
        if (seen.has(key))
        {
            return true;
        }
        seen.add(key);
        return false;
    }

    // Returns true when the value was empty (and an issue was recorded).
    private CheckEmpty(value: string, path: string): boolean
    {
        if (value === "")
        {
            this.Add(SecurityModelIssueCode.EmptyId, path, SecurityModelValidator.EmptyIdMessage);
            return true;
        }
        return false;
    }

    // While the tree is malformed (hierarchy undefined) only emptiness is checked.
    private CheckBusinessUnit(hierarchy: BusinessUnitHierarchy | undefined, id: string, path: string): void
    {
        if (!this.CheckEmpty(id, path) && hierarchy !== undefined && !hierarchy.Has(id))
        {
            this.Add(SecurityModelIssueCode.UnknownBusinessUnit, path, SecurityModelValidator.UnknownBusinessUnitMessage + id);
        }
    }

    private CheckUsers(hierarchy: BusinessUnitHierarchy | undefined): void
    {
        const seen = new Set<string>();
        this.config.users.forEach((user, i) =>
        {
            const base = SecurityModelValidator.Index(SecurityModelValidator.UsersPath, i);
            const idPath = base + SecurityModelValidator.PrincipalIdSuffix;
            if (!this.CheckEmpty(user.principalId, idPath) && this.Seen(seen, user.principalId))
            {
                this.Add(SecurityModelIssueCode.DuplicateUser, idPath, SecurityModelValidator.DuplicateUserMessage + user.principalId);
            }
            this.CheckBusinessUnit(hierarchy, user.businessUnitId, base + SecurityModelValidator.BusinessUnitIdSuffix);
        });
    }

    private CheckTeams(hierarchy: BusinessUnitHierarchy | undefined): ReadonlySet<string>
    {
        const seen = new Set<string>();
        this.config.teams.forEach((team, i) =>
        {
            const base = SecurityModelValidator.Index(SecurityModelValidator.TeamsPath, i);
            const idPath = base + SecurityModelValidator.IdSuffix;
            if (!this.CheckEmpty(team.id, idPath) && this.Seen(seen, team.id))
            {
                this.Add(SecurityModelIssueCode.DuplicateTeam, idPath, SecurityModelValidator.DuplicateTeamMessage + team.id);
            }
            this.CheckBusinessUnit(hierarchy, team.businessUnitId, base + SecurityModelValidator.BusinessUnitIdSuffix);
            team.idpGroups.forEach((g, j) => this.CheckEmpty(g, SecurityModelValidator.Index(base + SecurityModelValidator.IdpGroupsSuffix, j)));
            team.manualMembers.forEach((m, j) => this.CheckEmpty(m, SecurityModelValidator.Index(base + SecurityModelValidator.ManualMembersSuffix, j)));
        });
        return seen;
    }

    private CheckAssignments(section: string, entries: readonly IAssignmentView[], teamIds: ReadonlySet<string>, duplicateMessage: string): void
    {
        const seen = new Set<string>();
        entries.forEach((entry, i) =>
        {
            const base = SecurityModelValidator.Index(section, i);
            if (this.Seen(seen, entry.name))
            {
                this.Add(SecurityModelIssueCode.DuplicateEntry, base, duplicateMessage + entry.name);
            }
            entry.principalIds.forEach((p, j) => this.CheckEmpty(p, SecurityModelValidator.Index(base + SecurityModelValidator.PrincipalIdsSuffix, j)));
            entry.teamIds.forEach((t, j) =>
            {
                const path = SecurityModelValidator.Index(base + SecurityModelValidator.TeamIdsSuffix, j);
                if (!this.CheckEmpty(t, path) && !teamIds.has(t))
                {
                    this.Add(SecurityModelIssueCode.UnknownTeam, path, SecurityModelValidator.UnknownTeamMessage + t);
                }
            });
        });
    }

    private CheckRoleOverrides(): void
    {
        const actions = new Set<string>(Object.values(PrivilegeAction));
        const levels = new Set<string>(Object.values(AccessLevel));
        const seen = new Set<string>();
        this.config.roleOverrides.forEach((o, i) =>
        {
            const base = SecurityModelValidator.Index(SecurityModelValidator.RoleOverridesPath, i);
            if (!actions.has(o.action))
            {
                this.Add(SecurityModelIssueCode.UnknownAction, base + SecurityModelValidator.ActionSuffix, SecurityModelValidator.UnknownActionMessage + o.action);
            }
            if (!levels.has(o.level))
            {
                this.Add(SecurityModelIssueCode.UnknownLevel, base + SecurityModelValidator.LevelSuffix, SecurityModelValidator.UnknownLevelMessage + o.level);
            }
            this.CheckOverrideKey(seen, base, [o.role, o.concept, o.action]);
        });
    }

    private CheckProfileOverrides(): void
    {
        const seen = new Set<string>();
        this.config.profileOverrides.forEach((o, i) =>
        {
            this.CheckOverrideKey(seen, SecurityModelValidator.Index(SecurityModelValidator.ProfileOverridesPath, i), [o.profile, o.concept, o.field]);
        });
    }

    private CheckOverrideKey(seen: Set<string>, path: string, parts: readonly string[]): void
    {
        if (this.Seen(seen, parts.join(SecurityModelValidator.KeySeparator)))
        {
            this.Add(SecurityModelIssueCode.DuplicateOverride, path, SecurityModelValidator.DuplicateOverrideMessage + parts.join(SecurityModelValidator.DisplaySeparator));
        }
    }
}
