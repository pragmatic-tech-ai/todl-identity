import type { SourceToken, SourceTokenRequest } from "./source-token-provider.js";

export class PerUserSourceTokenCache
{
    private static readonly Separator = "\u0000";
    private static readonly DefaultSkewMs = 60_000;

    private readonly entries = new Map<string, SourceToken>();

    public constructor(private readonly skewMs: number = PerUserSourceTokenCache.DefaultSkewMs)
    {
    }

    public Get(request: SourceTokenRequest, now: Date): SourceToken | undefined
    {
        const token = this.entries.get(PerUserSourceTokenCache.KeyOf(request));
        if (token === undefined) return undefined;
        return token.ExpiresAt.getTime() - this.skewMs > now.getTime() ? token : undefined;
    }

    public Put(request: SourceTokenRequest, token: SourceToken): void
    {
        this.entries.set(PerUserSourceTokenCache.KeyOf(request), token);
    }

    public Forget(tenantId: string, principalId: string): void
    {
        const prefix = tenantId + PerUserSourceTokenCache.Separator + principalId + PerUserSourceTokenCache.Separator;
        for (const key of [...this.entries.keys()])
        {
            if (key.startsWith(prefix)) this.entries.delete(key);
        }
    }

    private static KeyOf(request: SourceTokenRequest): string
    {
        return [request.TenantId, request.PrincipalId, request.Resource].join(PerUserSourceTokenCache.Separator);
    }
}
