import { ServiceKey } from "@pragmatic-tech-ai/todl-runtime";
import type { IdentityConfig } from "./identity-config.js";

export interface ITenantConfigStore
{
    Get(tenantId: string): Promise<IdentityConfig | null>;
    Save(tenantId: string, config: IdentityConfig): Promise<void>;
    List(): Promise<readonly string[]>;
}

export const TenantConfigStoreKey = new ServiceKey<ITenantConfigStore>("IdentityTenantConfigStore");
