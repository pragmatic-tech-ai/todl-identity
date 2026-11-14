import type { Realm } from "../core/realm.js";
import type { PresentedSecret } from "./presented-secret.js";

export class ServiceTokenGrant
{
    public constructor(
        public readonly TokenRef: string,
        public readonly PrincipalId: string,
        public readonly RealmId: string,
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
    Issue(realm: Realm, principalId: string, scopes: readonly string[], expiresAt: Date | null): Promise<{ Grant: ServiceTokenGrant; Token: string }>;
    Resolve(realm: Realm, presented: PresentedSecret): Promise<ServiceTokenGrant | null>;
    Revoke(realm: Realm, tokenRef: string): Promise<void>;
    List(realm: Realm): Promise<readonly ServiceTokenSummary[]>;
}
