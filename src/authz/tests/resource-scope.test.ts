import { test } from "node:test";
import assert from "node:assert/strict";
import { ResourceRef } from "../../core/resource-ref.js";
import { ResourceKind } from "../../core/identity-enums.js";
import { ResourceScope } from "../resource-scope.js";

class ResourceScopeFixture
{
    public static Ref(realm: string, path: readonly string[], kind: ResourceKind = ResourceKind.Model): ResourceRef
    {
        return new ResourceRef(kind, realm, path);
    }
}

test("ancestor grant covers descendant in same realm; sibling and cross-realm do not", () =>
{
    const project = ResourceScopeFixture.Ref("t1", ["p1"], ResourceKind.Project);
    const model = ResourceScopeFixture.Ref("t1", ["p1", "m1"]);
    const realm = ResourceScopeFixture.Ref("t1", [], ResourceKind.Realm);
    assert.equal(ResourceScope.Covers(project, model), true);
    assert.equal(ResourceScope.Covers(realm, model), true);
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
