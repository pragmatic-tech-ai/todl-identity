import type { Tenant } from "../core/tenant.js";
import type { Grant } from "../core/grant.js";

export interface IRoleGrantStore
{
    GrantsFor(subject: string, tenant: Tenant): Promise<readonly Grant[]>;
    Save(grant: Grant): Promise<void>;
}
