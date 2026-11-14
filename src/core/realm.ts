import { RealmKind } from "./identity-enums.js";

export class Realm
{
    public constructor(
        public readonly Id: string,
        public readonly Kind: RealmKind,
        public readonly DisplayName: string,
    )
    {
    }

    public IsSelfHosted(): boolean
    {
        return this.Kind === RealmKind.SelfHosted;
    }
}
