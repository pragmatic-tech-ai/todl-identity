import type { ResourceRef } from "../core/resource-ref.js";

export class ResourceScope
{
    /** True iff `grant` is an ancestor-or-equal of `target`: same tenant and grant.Path is an element-wise prefix of target.Path. */
    public static Covers(grant: ResourceRef, target: ResourceRef): boolean
    {
        if (grant.TenantId !== target.TenantId)
        {
            return false;
        }

        if (grant.Path.length > target.Path.length)
        {
            return false;
        }

        for (let i = 0; i < grant.Path.length; i += 1)
        {
            if (grant.Path[i] !== target.Path[i])
            {
                return false;
            }
        }

        return true;
    }
}
