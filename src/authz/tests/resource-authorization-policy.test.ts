import { test } from "node:test";
import assert from "node:assert/strict";
import { Role, Action, ResourceKind, PrincipalKind, TenantKind } from "../../core/identity-enums.js";
import { Principal } from "../../core/principal.js";
import { Tenant } from "../../core/tenant.js";
import { ResourceRef } from "../../core/resource-ref.js";
import { Grant } from "../../core/grant.js";
import { AccessContext } from "../access-context.js";
import { ResourceAuthorizationPolicy } from "../resource-authorization-policy.js";

const policy = new ResourceAuthorizationPolicy();
const tenant = new Tenant("t1", TenantKind.Saas, "Acme");
const principal = new Principal("u1", "t1", PrincipalKind.User, new Map(), []);
const model = new ResourceRef(ResourceKind.Model, "t1", ["p1", "m1"]);

function context(grants: readonly Grant[]): AccessContext
{
    return new AccessContext(principal, tenant, grants, policy);
}

test("deny-by-default with no grants", () =>
{
    assert.equal(policy.Decide(context([]), Action.Read, model).Allowed, false);
});

test("a project-level Editor grant allows Read and Write but not Delete on a descendant model", () =>
{
    const grant = new Grant("u1", Role.Editor, new ResourceRef(ResourceKind.Project, "t1", ["p1"]));
    const ctx = context([grant]);
    assert.equal(policy.Decide(ctx, Action.Read, model).Allowed, true);
    assert.equal(policy.Decide(ctx, Action.Write, model).Allowed, true);
    assert.equal(policy.Decide(ctx, Action.Delete, model).Allowed, false);
});

test("a sibling-scoped grant does not allow", () =>
{
    const grant = new Grant("u1", Role.Owner, new ResourceRef(ResourceKind.Project, "t1", ["p2"]));
    assert.equal(policy.Decide(context([grant]), Action.Read, model).Allowed, false);
});

test("EntityFilterFor returns an allow-all predicate (policy rules are a later phase)", () =>
{
    const filter = policy.EntityFilterFor(context([]), Action.Read, "shop.Customer");
    assert.equal(filter.Matches({ Member: () => undefined }), true);
});
