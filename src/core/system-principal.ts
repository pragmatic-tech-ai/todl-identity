import { Principal } from "./principal.js";
import { PrincipalKind } from "./identity-enums.js";

export class SystemPrincipal
{
    private static readonly Prefix = "system:";
    private static readonly EmptyEnvironmentMessage = "SystemPrincipal requires a non-empty environment id";

    public static IdFor(environmentId: string): string
    {
        if (!environmentId) throw new Error(SystemPrincipal.EmptyEnvironmentMessage);
        return SystemPrincipal.Prefix + environmentId;
    }

    public static For(environmentId: string): Principal
    {
        return new Principal(SystemPrincipal.IdFor(environmentId), environmentId, PrincipalKind.System, new Map(), []);
    }

    public static Is(principal: Principal): boolean
    {
        return principal.Kind === PrincipalKind.System && principal.Id.startsWith(SystemPrincipal.Prefix);
    }
}
