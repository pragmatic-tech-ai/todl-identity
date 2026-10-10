import { test } from "node:test";
import assert from "node:assert/strict";
import { ResourceRef } from "../../core/resource-ref.js";
import { ResourceKind } from "../../core/identity-enums.js";
import { ResourceScope } from "../resource-scope.js";

class ResourceScopeFixture
{
    public static Ref(tenant: string, path: readonly string[], kind: ResourceKind = ResourceKind.Model): ResourceRef
    {
        return new ResourceRef(kind, tenant, path);
    }
}

test("ancestor grant covers descendant in same tenant; sibling and cross-tenant do not", () =>
{
    const project = ResourceScopeFixture.Ref("t1", ["p1"], ResourceKind.Project);
    const model = ResourceScopeFixture.Ref("t1", ["p1", "m1"]);
    const tenant = ResourceScopeFixture.Ref("t1", [], ResourceKind.Tenant);
    assert.equal(ResourceScope.Covers(project, model), true);
    assert.equal(ResourceScope.Covers(tenant, model), true);
    assert.equal(ResourceScope.Covers(model, model), true);
    assert.equal(ResourceScope.Covers(model, project), false);
    assert.equal(ResourceScope.Covers(ResourceScopeFixture.Ref("t1", ["p2"], ResourceKind.Project), model), false);
    assert.equal(ResourceScope.Covers(ResourceScopeFixture.Ref("t2", ["p1"], ResourceKind.Project), model), false);
});

test("path prefix is element-wise, not string-prefix", () =>
{
    const grant = ResourceScopeFixture.Ref("t1", ["p1"], ResourceKind.Project);
    assert.equal(ResourceScope.Covers(grant, ResourceScopeFixture.Ref("t1", ["p1", "m1"])), true);
    assert.equal(ResourceScope.Covers(grant, ResourceScopeFixture.Ref("t1", ["p1x", "m1"])), false);
});
