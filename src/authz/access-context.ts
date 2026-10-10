import type { Principal } from "../core/principal.js";
import type { Tenant } from "../core/tenant.js";
import type { Grant } from "../core/grant.js";
import type { IAccessPolicy } from "./access-policy.js";

export class AccessContext
{
    public constructor(
        public readonly Principal: Principal,
        public readonly Tenant: Tenant,
        public readonly Grants: readonly Grant[],
        public readonly Policy: IAccessPolicy,
    )
    {
    }
}
