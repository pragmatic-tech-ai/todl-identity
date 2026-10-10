import type { EntityPredicate } from "./entity-predicate.js";

export class AccessDecision
{
    private constructor(
        public readonly Allowed: boolean,
        public readonly Reason: string,
        public readonly EntityFilter?: EntityPredicate,
    )
    {
    }

    public static Allow(reason: string, filter?: EntityPredicate): AccessDecision
    {
        return new AccessDecision(true, reason, filter);
    }

    public static Deny(reason: string): AccessDecision
    {
        return new AccessDecision(false, reason, undefined);
    }
}
