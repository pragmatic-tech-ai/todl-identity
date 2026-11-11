import { ServiceKey } from "@pragmatic-tech-ai/todl-runtime";
import type { PresentedSecret } from "./presented-secret.js";

export class SourceTokenRequest
{
    public constructor(
        public readonly TenantId: string,
        public readonly PrincipalId: string,
        public readonly Resource: string)
    {
    }
}

export class SourceToken
{
    public constructor(
        public readonly Resource: string,
        public readonly Value: PresentedSecret,
        public readonly ExpiresAt: Date)
    {
    }
}

export enum SourceTokenFailure
{
    NoUpstreamSession = "noUpstreamSession",
    ExchangeRejected = "exchangeRejected",
    PrincipalInactive = "principalInactive",
    UnsupportedPrincipal = "unsupportedPrincipal",
}

export class SourceTokenError extends Error
{
    private static readonly NoUpstreamSessionMessage = "no upstream session for the principal";
    private static readonly ExchangeRejectedMessage = "the upstream token exchange was rejected";
    private static readonly PrincipalInactiveMessage = "the principal is not active";
    private static readonly GenericMessage = "source token acquisition failed";
    private static readonly UnsupportedPrincipalMessage = "the principal cannot obtain source tokens";

    public constructor(public readonly Failure: SourceTokenFailure)
    {
        super(SourceTokenError.MessageFor(Failure));
        this.name = "SourceTokenError";
    }

    private static MessageFor(failure: SourceTokenFailure): string
    {
        switch (failure)
        {
            case SourceTokenFailure.NoUpstreamSession: return SourceTokenError.NoUpstreamSessionMessage;
            case SourceTokenFailure.ExchangeRejected: return SourceTokenError.ExchangeRejectedMessage;
            case SourceTokenFailure.PrincipalInactive: return SourceTokenError.PrincipalInactiveMessage;
            case SourceTokenFailure.UnsupportedPrincipal: return SourceTokenError.UnsupportedPrincipalMessage;
            default: return SourceTokenError.GenericMessage;
        }
    }
}

export interface ISourceTokenProvider
{
    Acquire(request: SourceTokenRequest): Promise<SourceToken>;
}

export const SourceTokenProviderKey = new ServiceKey<ISourceTokenProvider>("IdentitySourceTokenProvider");
