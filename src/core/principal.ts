import { PrincipalKind } from "./identity-enums.js";

export class Principal
{
    public constructor(
        public readonly Id: string,
        public readonly TenantId: string,
        public readonly Kind: PrincipalKind,
        public readonly Claims: ReadonlyMap<string, string>,
        public readonly Groups: readonly string[],
    )
    {
    }

    public HasGroup(name: string): boolean
    {
        return this.Groups.includes(name);
    }

    public Claim(name: string): string | undefined
    {
        return this.Claims.get(name);
    }
}
