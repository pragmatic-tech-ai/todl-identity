import type { Tenant } from "../core/tenant.js";
import type { PresentedSecret } from "./presented-secret.js";

export class ServiceTokenGrant
{
    public constructor(
        public readonly TokenRef: string,
        public readonly PrincipalId: string,
        public readonly TenantId: string,
        public readonly Scopes: readonly string[],
        public readonly ExpiresAt: Date | null)
    {
    }
}

export class ServiceTokenSummary
{
    public constructor(
        public readonly TokenRef: string,
        public readonly PrincipalId: string,
        public readonly Scopes: readonly string[],
        public readonly ExpiresAt: Date | null,
        public readonly Revoked: boolean)
    {
    }
}

export interface IServiceTokenStore
{
    Issue(tenant: Tenant, principalId: string, scopes: readonly string[], expiresAt: Date | null): Promise<{ Grant: ServiceTokenGrant; Token: string }>;
    Resolve(tenant: Tenant, presented: PresentedSecret): Promise<ServiceTokenGrant | null>;
    Revoke(tenant: Tenant, tokenRef: string): Promise<void>;
    List(tenant: Tenant): Promise<readonly ServiceTokenSummary[]>;
}
