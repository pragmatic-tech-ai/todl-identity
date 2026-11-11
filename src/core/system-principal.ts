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

    /** Exactly the system principal id of that environment; an empty environment id matches nothing. */
    public static IsId(principalId: string, environmentId: string): boolean
    {
        return !!environmentId && principalId === SystemPrincipal.Prefix + environmentId;
    }

    /** Whether the id falls in the reserved system namespace; no account or external identity may take such an id. */
    public static IsReserved(principalId: string): boolean
    {
        return principalId.startsWith(SystemPrincipal.Prefix);
    }

    public static Is(principal: Principal): boolean
    {
        return principal.Kind === PrincipalKind.System && SystemPrincipal.IsId(principal.Id, principal.TenantId);
    }
}
