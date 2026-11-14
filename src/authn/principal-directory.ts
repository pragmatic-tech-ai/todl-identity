import type { Principal } from "../core/principal.js";
import type { Realm } from "../core/realm.js";

export interface IPrincipalDirectory
{
    Lookup(principalId: string, realm: Realm): Promise<Principal | null>;
    GroupsOf(principal: Principal): Promise<readonly string[]>;
}
