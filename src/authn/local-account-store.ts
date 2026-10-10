import type { Tenant } from "../core/tenant.js";

export class LocalAccount
{
    public constructor(
        public readonly PrincipalId: string,
        public readonly TenantId: string,
        public readonly Email: string,
        public readonly SecretRef: string)
    {
    }
}

export interface ILocalAccountStore
{
    CreateAccount(tenant: Tenant, email: string, principalId: string, secretRef: string): Promise<LocalAccount>;
    FindByEmail(tenant: Tenant, email: string): Promise<LocalAccount | null>;
    FindByPrincipalId(tenant: Tenant, principalId: string): Promise<LocalAccount | null>;
}
