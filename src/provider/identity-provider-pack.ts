import type { AuthMethod, DelegationDepth } from "../core/identity-enums.js";
import type { IAuthenticator } from "../authn/authenticator.js";
import type { ISessionManager } from "../authn/session-manager.js";
import type { IPrincipalDirectory } from "../authn/principal-directory.js";
import type { IRoleGrantStore } from "../authn/role-grant-store.js";
import type { IAccessPolicy } from "../authz/access-policy.js";
import type { IAuditSink } from "./audit-sink.js";

export interface IIdentityProviderPack
{
    readonly DelegationDepth: DelegationDepth;
    readonly Authenticators: readonly IAuthenticator[];
    readonly Directory: IPrincipalDirectory;
    readonly Sessions: ISessionManager;
    readonly Grants: IRoleGrantStore;
    readonly Policy?: IAccessPolicy;
    readonly Audit: IAuditSink;
    AuthenticatorFor(method: AuthMethod): IAuthenticator | undefined;
}
