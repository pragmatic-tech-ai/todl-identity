import { ServiceKey } from "@pragmatic-tech-ai/todl-runtime";
import type { Tenant } from "../core/tenant.js";
import type { IIdentityProviderPack } from "./identity-provider-pack.js";

export interface IIdentityProviderRegistry
{
    PackFor(tenant: Tenant): Promise<IIdentityProviderPack>;
}

export const IdentityProviderRegistryKey =
    new ServiceKey<IIdentityProviderRegistry>("IdentityProviderRegistry");
