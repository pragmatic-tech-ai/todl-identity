import type { Principal } from "../core/principal.js";
import type { Tenant } from "../core/tenant.js";

export interface IPrincipalDirectory
{
    Lookup(principalId: string, tenant: Tenant): Promise<Principal | null>;
    GroupsOf(principal: Principal): Promise<readonly string[]>;
}
