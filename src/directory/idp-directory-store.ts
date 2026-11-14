import { ServiceKey } from "@pragmatic-tech-ai/todl-runtime";
import type { IdpDirectorySnapshot } from "./idp-directory-snapshot.js";

export interface IIdpDirectoryStore
{
    /** Throws UnreadableIdpDirectoryRecordError when the stored record cannot be trusted (fail-closed); Save replaces it. */
    Get(realmId: string): Promise<IdpDirectorySnapshot | null>;
    Save(realmId: string, snapshot: IdpDirectorySnapshot): Promise<void>;
}

/** A stored directory snapshot for one realm is malformed; readers must not treat the realm's users as active. */
export class UnreadableIdpDirectoryRecordError extends Error
{
    private static readonly MessagePrefix = "stored IdP directory record is unreadable for realm ";
    private static readonly ReasonSeparator = ": ";

    public constructor(public readonly RealmId: string, public readonly Reason: string)
    {
        super(UnreadableIdpDirectoryRecordError.MessagePrefix + RealmId + UnreadableIdpDirectoryRecordError.ReasonSeparator + Reason);
        this.name = new.target.name;
    }
}

export const IdpDirectoryStoreKey = new ServiceKey<IIdpDirectoryStore>("IdentityIdpDirectoryStore");
