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
