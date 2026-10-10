import { Role, Action } from "../core/identity-enums.js";

export class RoleCapabilities
{
    private static readonly Capabilities: ReadonlyMap<Role, ReadonlySet<Action>> = new Map<Role, ReadonlySet<Action>>(
    [
        [Role.Viewer, new Set([Action.Read])],
        [Role.Editor, new Set([Action.Read, Action.Write])],
        [Role.Admin, new Set([Action.Read, Action.Write, Action.Delete, Action.Administer])],
        [Role.Owner, new Set([Action.Read, Action.Write, Action.Delete, Action.Administer, Action.Connect])],
    ]);

    public static Covers(role: Role, action: Action): boolean
    {
        return RoleCapabilities.Capabilities.get(role)?.has(action) ?? false;
    }
}
