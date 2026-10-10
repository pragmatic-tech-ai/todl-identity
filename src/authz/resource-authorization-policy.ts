import type { Action } from "../core/identity-enums.js";
import type { ResourceRef } from "../core/resource-ref.js";
import type { AccessContext } from "./access-context.js";
import { AccessDecision } from "./access-decision.js";
import type { IAccessPolicy } from "./access-policy.js";
import type { EntityPredicate, EntityView } from "./entity-predicate.js";
import { RoleCapabilities } from "./role-capabilities.js";
import { ResourceScope } from "./resource-scope.js";

export class ResourceAuthorizationPolicy implements IAccessPolicy
{
    private static readonly AllowReason = "covered by role grant";
    private static readonly DenyReason = "no grant covers this action on this resource";
    private static readonly AllowAll: EntityPredicate = { Matches: (_entity: EntityView) => true };

    public Decide(context: AccessContext, action: Action, resource: ResourceRef): AccessDecision
    {
        for (const grant of context.Grants)
        {
            if (ResourceScope.Covers(grant.Resource, resource) && RoleCapabilities.Covers(grant.Role, action))
            {
                return AccessDecision.Allow(ResourceAuthorizationPolicy.AllowReason);
            }
        }

        return AccessDecision.Deny(ResourceAuthorizationPolicy.DenyReason);
    }

    public EntityFilterFor(_context: AccessContext, _action: Action, _concept: string): EntityPredicate
    {
        return ResourceAuthorizationPolicy.AllowAll;
    }
}
