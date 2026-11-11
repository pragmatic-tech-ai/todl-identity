import type { SourceToken, SourceTokenRequest } from "./source-token-provider.js";

export class PerUserSourceTokenCache
{
    private static readonly DefaultSkewMs = 60_000;

    // tenantId -> principalId -> resource -> token
    private readonly tenants = new Map<string, Map<string, Map<string, SourceToken>>>();

    public constructor(private readonly skewMs: number = PerUserSourceTokenCache.DefaultSkewMs)
    {
    }

    public Get(request: SourceTokenRequest, now: Date): SourceToken | undefined
    {
        const resources = this.tenants.get(request.TenantId)?.get(request.PrincipalId);
        const token = resources?.get(request.Resource);
        if (token === undefined) return undefined;
        if (token.ExpiresAt.getTime() - this.skewMs > now.getTime()) return token;
        this.Remove(request.TenantId, request.PrincipalId, request.Resource);
        return undefined;
    }

    public Put(request: SourceTokenRequest, token: SourceToken): void
    {
        let principals = this.tenants.get(request.TenantId);
        if (principals === undefined)
        {
            principals = new Map();
            this.tenants.set(request.TenantId, principals);
        }
        let resources = principals.get(request.PrincipalId);
        if (resources === undefined)
        {
            resources = new Map();
            principals.set(request.PrincipalId, resources);
        }
        resources.set(request.Resource, token);
    }

    public Forget(tenantId: string, principalId: string): void
    {
        const principals = this.tenants.get(tenantId);
        if (principals === undefined) return;
        principals.delete(principalId);
        if (principals.size === 0) this.tenants.delete(tenantId);
    }

    private Remove(tenantId: string, principalId: string, resource: string): void
    {
        const principals = this.tenants.get(tenantId);
        const resources = principals?.get(principalId);
        if (principals === undefined || resources === undefined) return;
        resources.delete(resource);
        if (resources.size === 0) principals.delete(principalId);
        if (principals.size === 0) this.tenants.delete(tenantId);
    }
}
