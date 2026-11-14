import { ResourceKind } from "./identity-enums.js";

export class ResourceRef
{
    public constructor(
        public readonly Kind: ResourceKind,
        public readonly RealmId: string,
        public readonly Path: readonly string[],
    )
    {
    }
}
