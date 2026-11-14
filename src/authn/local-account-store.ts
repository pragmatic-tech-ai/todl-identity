import type { Realm } from "../core/realm.js";

export class LocalAccount
{
    public constructor(
        public readonly PrincipalId: string,
        public readonly RealmId: string,
        public readonly Email: string,
        public readonly SecretRef: string,
        public readonly Disabled: boolean)
    {
    }
}

export class LocalAccountNotFoundError extends Error
{
    public constructor(public readonly PrincipalId: string)
    {
        super("local account not found");
        this.name = "LocalAccountNotFoundError";
    }
}

export interface ILocalAccountStore
{
    CreateAccount(realm: Realm, email: string, principalId: string, secretRef: string): Promise<LocalAccount>;
    FindByEmail(realm: Realm, email: string): Promise<LocalAccount | null>;
    FindByPrincipalId(realm: Realm, principalId: string): Promise<LocalAccount | null>;
    Disable(realm: Realm, principalId: string): Promise<void>;
    Enable(realm: Realm, principalId: string): Promise<void>;
    ListAccounts(realm: Realm): Promise<readonly LocalAccount[]>;
}
