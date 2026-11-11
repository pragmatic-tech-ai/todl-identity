import { ServiceKey } from "@pragmatic-tech-ai/todl-runtime";
import type { IdpDirectorySnapshot } from "./idp-directory-snapshot.js";

export interface IIdpDirectoryStore
{
    /** Throws UnreadableIdpDirectoryRecordError when the stored record cannot be trusted (fail-closed); Save replaces it. */
    Get(tenantId: string): Promise<IdpDirectorySnapshot | null>;
    Save(tenantId: string, snapshot: IdpDirectorySnapshot): Promise<void>;
}

/** A stored directory snapshot for one tenant is malformed; readers must not treat the tenant's users as active. */
export class UnreadableIdpDirectoryRecordError extends Error
{
    private static readonly MessagePrefix = "stored IdP directory record is unreadable for tenant ";
    private static readonly ReasonSeparator = ": ";

    public constructor(public readonly TenantId: string, public readonly Reason: string)
    {
        super(UnreadableIdpDirectoryRecordError.MessagePrefix + TenantId + UnreadableIdpDirectoryRecordError.ReasonSeparator + Reason);
        this.name = new.target.name;
    }
}

export const IdpDirectoryStoreKey = new ServiceKey<IIdpDirectoryStore>("IdentityIdpDirectoryStore");
