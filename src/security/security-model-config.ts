// Per-tenant security data model configuration — a mutable setting carried on IdentityConfig.
// Pure data shapes; no dependency on the todl compiler or any higher layer.

export interface IBusinessUnitConfig
{
    readonly id: string;
    readonly name: string;
    readonly parent?: string;
}

export interface ITeamConfig
{
    readonly id: string;
    readonly name: string;
    readonly owningBusinessUnit?: string;
}

export interface IMembershipClaimRule
{
    readonly claim: string;
    readonly value: string;
    readonly homeBusinessUnit?: string;
    readonly teams?: readonly string[];
}

export interface IMembershipOverride
{
    readonly principalId: string;
    readonly homeBusinessUnit?: string;
    readonly teams?: readonly string[];
}

export interface IMembershipConfig
{
    readonly claimsMapping: readonly IMembershipClaimRule[];
    readonly overrides: readonly IMembershipOverride[];
}

// String enum: serializes directly to its author-friendly token, so persistence needs no mapping.
export enum OwnershipSourceKind
{
    Fixed = "fixed",
    FromField = "fromField",
}

export interface IOwnershipSource
{
    readonly kind: OwnershipSourceKind;
    readonly value: string;
}

export interface IOwnershipRuleConfig
{
    readonly concept: string;
    readonly owningBusinessUnit: IOwnershipSource;
    readonly owner?: IOwnershipSource;
}

export interface ISecurityModelConfig
{
    readonly businessUnits: readonly IBusinessUnitConfig[];
    readonly teams: readonly ITeamConfig[];
    readonly membership: IMembershipConfig;
    readonly ownershipRules: readonly IOwnershipRuleConfig[];
    readonly roles?: readonly IRoleConfig[];
    readonly roleAssignment?: IRoleAssignmentConfig;
    readonly fieldSecurity?: IFieldSecurityConfig;
}

// --- SP-3a: roles, privileges, role assignment ---

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
}

export enum AccessLevel
{
    None = "none",
    User = "user",
    BusinessUnit = "businessUnit",
    BusinessUnitAndChildren = "businessUnitAndChildren",
    Organization = "organization",
}

export interface IPrivilegeConfig
{
    readonly action: PrivilegeAction;
    readonly concept: string;
    readonly level: AccessLevel;
}

export interface IRoleConfig
{
    readonly id: string;
    readonly name: string;
    readonly privileges: readonly IPrivilegeConfig[];
}

export interface IRoleClaimRule
{
    readonly claim: string;
    readonly value: string;
    readonly roles: readonly string[];
}

export interface IRoleOverride
{
    readonly principalId: string;
    readonly roles: readonly string[];
}

export interface ITeamRoleGrant
{
    readonly teamId: string;
    readonly roles: readonly string[];
}

export interface IRoleAssignmentConfig
{
    readonly claimsMapping: readonly IRoleClaimRule[];
    readonly overrides: readonly IRoleOverride[];
    readonly teamRoles: readonly ITeamRoleGrant[];
}

// --- SP-4: field-level security (field security profiles) ---

export interface ISecuredFieldConfig
{
    readonly concept: string;
    readonly field: string;
}

export interface IFieldGrantConfig
{
    readonly concept: string;
    readonly field: string;
    readonly read?: boolean;
    readonly update?: boolean;
    readonly create?: boolean;
}

export interface IFieldProfileConfig
{
    readonly id: string;
    readonly name: string;
    readonly grants: readonly IFieldGrantConfig[];
}

export interface IFieldProfileClaimRule
{
    readonly claim: string;
    readonly value: string;
    readonly profiles: readonly string[];
}

export interface IFieldProfileOverride
{
    readonly principalId: string;
    readonly profiles: readonly string[];
}

export interface IFieldProfileTeamGrant
{
    readonly teamId: string;
    readonly profiles: readonly string[];
}

export interface IFieldProfileAssignmentConfig
{
    readonly claimsMapping: readonly IFieldProfileClaimRule[];
    readonly overrides: readonly IFieldProfileOverride[];
    readonly teamProfiles: readonly IFieldProfileTeamGrant[];
}

export interface IFieldSecurityConfig
{
    readonly securedFields: readonly ISecuredFieldConfig[];
    readonly profiles: readonly IFieldProfileConfig[];
    readonly profileAssignment: IFieldProfileAssignmentConfig;
}
