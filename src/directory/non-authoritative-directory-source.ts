import type { Tenant } from "../core/tenant.js";
import { IdpDirectorySnapshot } from "./idp-directory-snapshot.js";
import type { IdpDirectoryRequest, IIdpDirectorySource } from "./idp-directory-source.js";

/** For an external IdP with no directory connector: every snapshot is non-authoritative, so membership falls back to sign-in claims. */
export class NonAuthoritativeDirectorySource implements IIdpDirectorySource
{
    public readonly Authoritative = false;

    public constructor(private readonly now: () => Date = () => new Date())
    {
    }

    public async Snapshot(_tenant: Tenant, _request: IdpDirectoryRequest): Promise<IdpDirectorySnapshot>
    {
        return IdpDirectorySnapshot.NonAuthoritative(this.now());
    }
}
