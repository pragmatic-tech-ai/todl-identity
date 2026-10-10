export enum TenantKind
{
    Saas,
    SelfHosted,
}

export enum PrincipalKind
{
    User,
    Service,
    Machine,
}

export enum Role
{
    Viewer,
    Editor,
    Admin,
    Owner,
}

export enum Action
{
    Read,
    Write,
    Delete,
    Administer,
    Connect,
}

export enum ResourceKind
{
    Tenant,
    Project,
    Model,
    Connector,
}

export enum AuthMethod
{
    Oidc,
    Local,
    ServiceToken,
    Machine,
}

export enum DelegationDepth
{
    AuthnDirectory,
    ExternalGrants,
    FullAuthz,
}
