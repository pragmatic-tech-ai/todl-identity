import type { Tenant } from "../core/tenant.js";

export interface ITenantResolver
{
    Resolve(hint: string): Promise<Tenant | null>;
}
