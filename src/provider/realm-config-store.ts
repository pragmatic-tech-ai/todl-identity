import { ServiceKey } from "@pragmatic-tech-ai/todl-runtime";
import type { IdentityConfig } from "./identity-config.js";

export interface IRealmConfigStore
{
    Get(realmId: string): Promise<IdentityConfig | null>;
    Save(realmId: string, config: IdentityConfig): Promise<void>;
    List(): Promise<readonly string[]>;
}

export const RealmConfigStoreKey = new ServiceKey<IRealmConfigStore>("IdentityRealmConfigStore");
