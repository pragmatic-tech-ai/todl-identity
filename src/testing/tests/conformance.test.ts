import { DelegationDepth, PrincipalKind } from "../../core/identity-enums.js";
import { Principal } from "../../core/principal.js";
import { FakeIdentityProviderPack } from "../fakes.js";
import { IdentityPackConformance } from "../provider-pack-conformance.js";

const principal = new Principal("p1", "t1", PrincipalKind.User, new Map(), []);

IdentityPackConformance.Describe(
    "FakePack(AuthnDirectory)",
    () => new FakeIdentityProviderPack(DelegationDepth.AuthnDirectory, principal),
);

IdentityPackConformance.Describe(
    "FakePack(FullAuthz)",
    () => new FakeIdentityProviderPack(DelegationDepth.FullAuthz, principal),
);
