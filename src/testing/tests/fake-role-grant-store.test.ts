import { test } from "node:test";
import assert from "node:assert/strict";
import { Role, ResourceKind, TenantKind } from "../../core/identity-enums.js";
import { Grant } from "../../core/grant.js";
import { ResourceRef } from "../../core/resource-ref.js";
import { Tenant } from "../../core/tenant.js";
import { FakeRoleGrantStore } from "../fakes.js";

class GrantFixture
{
    public static Tenant(): Tenant
    {
        return new Tenant("t1", TenantKind.Saas, "t1");
    }

    public static Grant(subject: string, role: Role): Grant
    {
        return new Grant(subject, role, new ResourceRef(ResourceKind.Tenant, "t1", []));
    }
}

test("FakeRoleGrantStore.Revoke removes the matching grant and leaves others", async () =>
{
    const store = new FakeRoleGrantStore();
    await store.Save(GrantFixture.Grant("u1", Role.Owner));
    await store.Save(GrantFixture.Grant("u1", Role.Viewer));

    await store.Revoke(GrantFixture.Grant("u1", Role.Owner));

    const remaining = await store.GrantsFor("u1", GrantFixture.Tenant());
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0]!.Role, Role.Viewer);
});

test("FakeRoleGrantStore.Revoke is a no-op when no grant matches", async () =>
{
    const store = new FakeRoleGrantStore();
    await store.Save(GrantFixture.Grant("u1", Role.Viewer));

    await store.Revoke(GrantFixture.Grant("u1", Role.Owner));

    const remaining = await store.GrantsFor("u1", GrantFixture.Tenant());
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0]!.Role, Role.Viewer);
});

test("FakeRoleGrantStore.GrantsOn returns only the queried tenant's tenant-root grants", async () =>
{
    const store = new FakeRoleGrantStore();
    await store.Save(new Grant("a1", Role.Admin, new ResourceRef(ResourceKind.Tenant, "t1", [])));
    await store.Save(new Grant("o1", Role.Owner, new ResourceRef(ResourceKind.Tenant, "t1", [])));
    await store.Save(new Grant("a2", Role.Admin, new ResourceRef(ResourceKind.Tenant, "t2", [])));
    await store.Save(new Grant("p1", Role.Admin, new ResourceRef(ResourceKind.Project, "t1", ["proj"])));

    const onRoot = await store.GrantsOn(new ResourceRef(ResourceKind.Tenant, "t1", []));

    assert.deepEqual(onRoot.map((g) => g.Subject).sort(), ["a1", "o1"]);
    const onProject = await store.GrantsOn(new ResourceRef(ResourceKind.Project, "t1", ["proj"]));
    assert.deepEqual(onProject.map((g) => g.Subject), ["p1"]);
});
