import type { Realm } from "../core/realm.js";

export interface IRealmResolver
{
    Resolve(hint: string): Promise<Realm | null>;
}
