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
}
