import { AuthMethod, DelegationDepth, PrincipalKind, TenantKind } from "../core/identity-enums.js";
import { Principal } from "../core/principal.js";
import { Session } from "../core/session.js";
import { Tenant } from "../core/tenant.js";
import type { Grant } from "../core/grant.js";
import { Credential } from "../authn/credential.js";
import {
    AuthenticatedResult,
    AuthenticationResult,
    RejectedResult,
} from "../authn/authentication-result.js";
import type { IAuthenticator } from "../authn/authenticator.js";
import type { ISessionManager } from "../authn/session-manager.js";
import type { IPrincipalDirectory } from "../authn/principal-directory.js";
import type { IRoleGrantStore } from "../authn/role-grant-store.js";
import { AccessDecision } from "../authz/access-decision.js";
import type { IAccessPolicy } from "../authz/access-policy.js";
import type { AccessContext } from "../authz/access-context.js";
import type { Action } from "../core/identity-enums.js";
import type { ResourceRef } from "../core/resource-ref.js";
import type { EntityPredicate, EntityView } from "../authz/entity-predicate.js";
import { AuditEvent } from "../provider/audit-sink.js";
import type { IAuditSink } from "../provider/audit-sink.js";
import type { IIdentityProviderPack } from "../provider/identity-provider-pack.js";
import type { IIdentityProviderRegistry } from "../provider/identity-provider-registry.js";

export class FakeAuthenticator implements IAuthenticator
{
    private static readonly AcceptedReference = "accept";
    private static readonly RejectionReason = "fake rejection";

    public constructor(public readonly Method: AuthMethod, private readonly principal: Principal)
    {
    }

    public async Authenticate(credential: Credential, _tenant: Tenant): Promise<AuthenticationResult>
    {
        if (credential.Reference === FakeAuthenticator.AcceptedReference)
        {
            return new AuthenticatedResult(this.principal);
        }

        return new RejectedResult(FakeAuthenticator.RejectionReason);
    }
}

export class FakeSessionManager implements ISessionManager
{
    private readonly sessions = new Map<string, Session>();
    private counter = 0;

    public async Issue(principal: Principal): Promise<Session>
    {
        this.counter += 1;
        const id = `s${this.counter}`;
        const session = new Session(
            id,
            principal.Id,
            principal.TenantId,
            new Date(0),
            new Date(8640000000000000),
            AuthMethod.Local,
        );
        this.sessions.set(id, session);
        return session;
    }

    public async Validate(token: string): Promise<Session | null>
    {
        return this.sessions.get(token) ?? null;
    }

    public async Revoke(sessionId: string): Promise<void>
    {
        this.sessions.delete(sessionId);
    }
}

export class FakePrincipalDirectory implements IPrincipalDirectory
{
    public constructor(private readonly principal: Principal)
    {
    }

    public async Lookup(principalId: string, _tenant: Tenant): Promise<Principal | null>
    {
        return principalId === this.principal.Id ? this.principal : null;
    }

    public async GroupsOf(principal: Principal): Promise<readonly string[]>
    {
        return principal.Groups;
    }
}

export class FakeRoleGrantStore implements IRoleGrantStore
{
    private readonly grants: Grant[] = [];

    public async GrantsFor(subject: string, _tenant: Tenant): Promise<readonly Grant[]>
    {
        return this.grants.filter((g) => g.Subject === subject);
    }

    public async Save(grant: Grant): Promise<void>
    {
        this.grants.push(grant);
    }
}

export class FakeAccessPolicy implements IAccessPolicy
{
    private static readonly AllowReason = "fake allow";

    public Decide(_context: AccessContext, _action: Action, _resource: ResourceRef): AccessDecision
    {
        return AccessDecision.Allow(FakeAccessPolicy.AllowReason);
    }

    public EntityFilterFor(_context: AccessContext, _action: Action, _concept: string): EntityPredicate
    {
        return { Matches: (_e: EntityView) => true };
    }
}

export class FakeAuditSink implements IAuditSink
{
    public readonly Events: AuditEvent[] = [];

    public async Record(event: AuditEvent): Promise<void>
    {
        this.Events.push(event);
    }
}

export class FakeIdentityProviderPack implements IIdentityProviderPack
{
    public readonly Authenticators: readonly IAuthenticator[];
    public readonly Directory: IPrincipalDirectory;
    public readonly Sessions: ISessionManager;
    public readonly Grants: IRoleGrantStore;
    public readonly Policy?: IAccessPolicy;
    public readonly Audit: IAuditSink;
    public readonly DelegationDepth: DelegationDepth;

    public constructor(depth: DelegationDepth, principal: Principal)
    {
        this.DelegationDepth = depth;
        this.Authenticators = [new FakeAuthenticator(AuthMethod.Local, principal)];
        this.Directory = new FakePrincipalDirectory(principal);
        this.Sessions = new FakeSessionManager();
        this.Grants = new FakeRoleGrantStore();
        this.Audit = new FakeAuditSink();
        this.Policy = depth === DelegationDepth.FullAuthz ? new FakeAccessPolicy() : undefined;
    }

    public AuthenticatorFor(method: AuthMethod): IAuthenticator | undefined
    {
        return this.Authenticators.find((a) => a.Method === method);
    }

    public static Default(): FakeIdentityProviderPack
    {
        const principal = new Principal("p1", "t1", PrincipalKind.User, new Map(), []);
        return new FakeIdentityProviderPack(DelegationDepth.AuthnDirectory, principal);
    }
}

export class FakeIdentityProviderRegistry implements IIdentityProviderRegistry
{
    public constructor(private readonly pack: IIdentityProviderPack)
    {
    }

    public async PackFor(_tenant: Tenant): Promise<IIdentityProviderPack>
    {
        return this.pack;
    }

    public static Default(): FakeIdentityProviderRegistry
    {
        return new FakeIdentityProviderRegistry(FakeIdentityProviderPack.Default());
    }
}

export class FakeTenant
{
    public static Saas(): Tenant
    {
        return new Tenant("t1", TenantKind.Saas, "Acme");
    }
}
