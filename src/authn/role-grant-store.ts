import type { Tenant } from "../core/tenant.js";
import type { Grant } from "../core/grant.js";
import type { ResourceRef } from "../core/resource-ref.js";

export interface IRoleGrantStore
{
    GrantsFor(subject: string, tenant: Tenant): Promise<readonly Grant[]>;
    Save(grant: Grant): Promise<void>;
    Revoke(grant: Grant): Promise<void>;
    GrantsOn(resource: ResourceRef): Promise<readonly Grant[]>;
}
