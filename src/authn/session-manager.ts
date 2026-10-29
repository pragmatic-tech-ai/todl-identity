import type { Principal } from "../core/principal.js";
import type { Session } from "../core/session.js";

export interface ISessionManager
{
    Issue(principal: Principal): Promise<Session>;
    Validate(token: string): Promise<Session | null>;
    Revoke(sessionId: string): Promise<void>;
    RevokeAllFor(principalId: string): Promise<void>;
}
