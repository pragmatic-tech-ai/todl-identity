import { test } from "node:test";
import assert from "node:assert/strict";
import { RejectedResult } from "../authn/authentication-result.js";
import { Credential } from "../authn/credential.js";
import { PresentedSecret } from "../authn/presented-secret.js";
import { DelegationDepth, PrincipalKind, TenantKind } from "../core/identity-enums.js";
import { Principal } from "../core/principal.js";
import { Tenant } from "../core/tenant.js";
import type { IIdentityProviderPack } from "../provider/identity-provider-pack.js";

export class IdentityPackConformance
{
    public static Describe(label: string, make: () => IIdentityProviderPack): void
    {
        test(`${label}: Policy present iff FullAuthz`, () =>
        {
            const pack = make();
            if (pack.DelegationDepth === DelegationDepth.FullAuthz)
            {
                assert.ok(pack.Policy !== undefined, "FullAuthz pack must supply a Policy");
            }
            else
            {
                assert.equal(pack.Policy, undefined, "non-FullAuthz pack must not supply a Policy");
            }
        });

        test(`${label}: declared authenticators are resolvable by method`, () =>
        {
            const pack = make();
            assert.ok(pack.Authenticators.length > 0, "a pack exposes at least one authenticator");
            for (const authenticator of pack.Authenticators)
            {
                assert.equal(pack.AuthenticatorFor(authenticator.Method), authenticator);
            }
        });

        test(`${label}: session issue then validate round-trips`, async () =>
        {
            const pack = make();
            const principal = new Principal("p1", "t1", PrincipalKind.User, new Map(), []);
            const issued = await pack.Sessions.Issue(principal);
            const validated = await pack.Sessions.Validate(issued.Id);
            assert.ok(validated !== null);
            assert.equal(validated?.PrincipalId, principal.Id);
            await pack.Sessions.Revoke(issued.Id);
            assert.equal(await pack.Sessions.Validate(issued.Id), null);
        });

        test(`${label}: authentication rejects a bad presented secret`, async () =>
        {
            const pack = make();
            const authenticator = pack.Authenticators[0]!;
            const tenant = new Tenant("t1", TenantKind.Saas, "Conformance");
            const credential = new Credential(authenticator.Method, "nobody@example.test");
            const presented = new PresentedSecret("deny");
            const result = await authenticator.Authenticate(credential, presented, tenant);
            assert.ok(result instanceof RejectedResult, "a bad presented secret yields RejectedResult, not a throw or Authenticated");
        });
    }
}
