import { TenantKind } from "./identity-enums.js";

export class Tenant
{
    public constructor(
        public readonly Id: string,
        public readonly Kind: TenantKind,
        public readonly DisplayName: string,
    )
    {
    }

    public IsSelfHosted(): boolean
    {
        return this.Kind === TenantKind.SelfHosted;
    }
}
