import { ServiceKey } from "@pragmatic-tech-ai/todl-runtime";
import type { Realm } from "../core/realm.js";
import type { IIdentityProviderPack } from "./identity-provider-pack.js";

export interface IIdentityProviderRegistry
{
    PackFor(realm: Realm): Promise<IIdentityProviderPack>;
}

export const IdentityProviderRegistryKey =
    new ServiceKey<IIdentityProviderRegistry>("IdentityProviderRegistry");
