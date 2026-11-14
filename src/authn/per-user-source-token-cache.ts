import type { SourceToken, SourceTokenRequest } from "./source-token-provider.js";

export class PerUserSourceTokenCache
{
    private static readonly DefaultSkewMs = 60_000;

    // realmId -> principalId -> resource -> token
    private readonly realms = new Map<string, Map<string, Map<string, SourceToken>>>();

    public constructor(private readonly skewMs: number = PerUserSourceTokenCache.DefaultSkewMs)
    {
    }

    public Get(request: SourceTokenRequest, now: Date): SourceToken | undefined
    {
        const resources = this.realms.get(request.RealmId)?.get(request.PrincipalId);
        const token = resources?.get(request.Resource);
        if (token === undefined) return undefined;
        if (token.ExpiresAt.getTime() - this.skewMs > now.getTime()) return token;
        this.Remove(request.RealmId, request.PrincipalId, request.Resource);
        return undefined;
    }

    public Put(request: SourceTokenRequest, token: SourceToken): void
    {
        let principals = this.realms.get(request.RealmId);
        if (principals === undefined)
        {
            principals = new Map();
            this.realms.set(request.RealmId, principals);
        }
        let resources = principals.get(request.PrincipalId);
        if (resources === undefined)
        {
            resources = new Map();
            principals.set(request.PrincipalId, resources);
        }
        resources.set(request.Resource, token);
    }

    public Forget(realmId: string, principalId: string): void
    {
        const principals = this.realms.get(realmId);
        if (principals === undefined) return;
        principals.delete(principalId);
        if (principals.size === 0) this.realms.delete(realmId);
    }

    private Remove(realmId: string, principalId: string, resource: string): void
    {
        const principals = this.realms.get(realmId);
        const resources = principals?.get(principalId);
        if (principals === undefined || resources === undefined) return;
        resources.delete(resource);
        if (resources.size === 0) principals.delete(principalId);
        if (principals.size === 0) this.realms.delete(realmId);
    }
}
