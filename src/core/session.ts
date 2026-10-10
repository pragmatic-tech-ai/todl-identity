import { AuthMethod } from "./identity-enums.js";

export class Session
{
    public constructor(
        public readonly Id: string,
        public readonly PrincipalId: string,
        public readonly TenantId: string,
        public readonly IssuedAt: Date,
        public readonly ExpiresAt: Date,
        public readonly AuthMethod: AuthMethod,
    )
    {
    }

    public IsExpired(now: Date): boolean
    {
        return now.getTime() >= this.ExpiresAt.getTime();
    }
}
