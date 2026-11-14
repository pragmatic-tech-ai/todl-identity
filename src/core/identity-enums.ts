export enum RealmKind
{
    Saas,
    SelfHosted,
}

export enum PrincipalKind
{
    User,
    Service,
    Machine,
    System,
}

export enum Role
{
    Viewer,
    Editor,
    Admin,
    Owner,
    Maker,
}

export enum Action
{
    Read,
    Write,
    Delete,
    Administer,
    Connect,
    Contribute,
}

export enum ResourceKind
{
    Realm,
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
