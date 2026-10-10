import type { Action } from "../core/identity-enums.js";
import type { ResourceRef } from "../core/resource-ref.js";
import type { AccessContext } from "./access-context.js";
import type { AccessDecision } from "./access-decision.js";
import type { EntityPredicate } from "./entity-predicate.js";

export interface IAccessPolicy
{
    Decide(context: AccessContext, action: Action, resource: ResourceRef): AccessDecision;
    EntityFilterFor(context: AccessContext, action: Action, concept: string): EntityPredicate;
}
