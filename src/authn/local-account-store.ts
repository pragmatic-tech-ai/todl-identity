import type { Tenant } from "../core/tenant.js";

export class LocalAccount
{
    public constructor(
        public readonly PrincipalId: string,
        public readonly TenantId: string,
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
    CreateAccount(tenant: Tenant, email: string, principalId: string, secretRef: string): Promise<LocalAccount>;
    FindByEmail(tenant: Tenant, email: string): Promise<LocalAccount | null>;
    FindByPrincipalId(tenant: Tenant, principalId: string): Promise<LocalAccount | null>;
    Disable(tenant: Tenant, principalId: string): Promise<void>;
    ListAccounts(tenant: Tenant): Promise<readonly LocalAccount[]>;
}
