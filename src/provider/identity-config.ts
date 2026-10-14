import type { DelegationDepth, Role } from "../core/identity-enums.js";
import type { ISecurityModelConfig } from "../security/security-model-config.js";

export class IdentityConfig
{
    public constructor(
        public readonly PackId: string,
        public readonly DelegationDepth: DelegationDepth,
        public readonly ProviderSettings: ReadonlyMap<string, string>,
        public readonly GroupRoleMap: ReadonlyMap<string, Role>,
        public readonly ClaimsMapping: ReadonlyMap<string, string>,
        public readonly SecurityModel?: ISecurityModelConfig,
    )
    {
    }
}
