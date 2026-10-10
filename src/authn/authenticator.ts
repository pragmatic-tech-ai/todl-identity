import type { AuthMethod } from "../core/identity-enums.js";
import type { Tenant } from "../core/tenant.js";
import type { Credential } from "./credential.js";
import type { AuthenticationResult } from "./authentication-result.js";
import type { PresentedSecret } from "./presented-secret.js";

export interface IAuthenticator
{
    readonly Method: AuthMethod;
    Authenticate(credential: Credential, presented: PresentedSecret, tenant: Tenant): Promise<AuthenticationResult>;
}
