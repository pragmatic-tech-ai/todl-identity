// Per-environment security setting (contract C5) — a mutable setting carried on IdentityConfig.
// Pure data shapes; no dependency on the todl compiler or any higher layer.

export enum PrivilegeAction
{
    Create = "create",
    Read = "read",
    Update = "update",
    Delete = "delete",
    Append = "append",
    AppendTo = "appendTo",
    Assign = "assign",
    Share = "share",
    Invoke = "invoke",
}

export enum AccessLevel
{
    None = "none",
    User = "user",
    BusinessUnit = "businessUnit",
    BusinessUnitAndChildren = "businessUnitAndChildren",
    Organization = "organization",
}

export interface IBusinessUnitConfig
{
    readonly id: string;
    readonly name: string;
    readonly parent?: string;
}

export interface IUserPlacementConfig
{
    readonly principalId: string;
    readonly businessUnitId: string;
}

export interface ITeamConfig
{
    readonly id: string;
    readonly name: string;
    readonly businessUnitId: string;
    readonly idpGroups: readonly string[];
    readonly manualMembers: readonly string[];
}

export interface IRoleAssignmentConfig
{
    readonly role: string;
    readonly principalIds: readonly string[];
    readonly teamIds: readonly string[];
}

export interface IProfileAssignmentConfig
{
    readonly profile: string;
    readonly principalIds: readonly string[];
    readonly teamIds: readonly string[];
}

export interface IRoleOverrideConfig
{
    readonly role: string;
    readonly concept: string;
    readonly action: PrivilegeAction;
    readonly level: AccessLevel;
}

export interface IProfileOverrideConfig
{
    readonly profile: string;
    readonly concept: string;
    readonly field: string;
    readonly read: boolean;
    readonly update: boolean;
    readonly create: boolean;
}

export interface ISecurityModelConfig
{
    readonly businessUnits: readonly IBusinessUnitConfig[];
    readonly users: readonly IUserPlacementConfig[];
    readonly teams: readonly ITeamConfig[];
    readonly roleAssignments: readonly IRoleAssignmentConfig[];
    readonly profileAssignments: readonly IProfileAssignmentConfig[];
    readonly roleOverrides: readonly IRoleOverrideConfig[];
    readonly profileOverrides: readonly IProfileOverrideConfig[];
}
