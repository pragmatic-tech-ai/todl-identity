import type { AuthMethod } from "../core/identity-enums.js";
import type { Realm } from "../core/realm.js";
import type { Credential } from "./credential.js";
import type { AuthenticationResult } from "./authentication-result.js";
import type { PresentedSecret } from "./presented-secret.js";

export interface IAuthenticator
{
    readonly Method: AuthMethod;
    Authenticate(credential: Credential, presented: PresentedSecret, realm: Realm): Promise<AuthenticationResult>;
}
