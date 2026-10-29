import type { Principal } from "../core/principal.js";
import type { Session } from "../core/session.js";
import type { Tenant } from "../core/tenant.js";

export interface ISessionManager
{
    Issue(principal: Principal): Promise<Session>;
    Validate(token: string): Promise<Session | null>;
    Revoke(sessionId: string): Promise<void>;
    RevokeAllFor(tenant: Tenant, principalId: string): Promise<void>;
}
