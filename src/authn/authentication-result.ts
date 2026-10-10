import type { Principal } from "../core/principal.js";

export enum AuthenticationOutcome
{
    Authenticated,
    Challenge,
    Rejected,
}

export abstract class AuthenticationResult
{
    protected constructor(public readonly Outcome: AuthenticationOutcome)
    {
    }
}

export class AuthenticatedResult extends AuthenticationResult
{
    public constructor(public readonly Principal: Principal)
    {
        super(AuthenticationOutcome.Authenticated);
    }
}

export class ChallengeResult extends AuthenticationResult
{
    public constructor(public readonly NextStep: string)
    {
        super(AuthenticationOutcome.Challenge);
    }
}

export class RejectedResult extends AuthenticationResult
{
    public constructor(public readonly Reason: string)
    {
        super(AuthenticationOutcome.Rejected);
    }
}
