import { ServiceKey } from "@pragmatic-tech-ai/todl-runtime";
import type { IdpDirectorySnapshot } from "./idp-directory-snapshot.js";

export interface IIdpDirectoryStore
{
    Get(tenantId: string): Promise<IdpDirectorySnapshot | null>;
    Save(tenantId: string, snapshot: IdpDirectorySnapshot): Promise<void>;
}

export const IdpDirectoryStoreKey = new ServiceKey<IIdpDirectoryStore>("IdentityIdpDirectoryStore");
