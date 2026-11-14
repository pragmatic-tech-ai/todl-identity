import { test } from "node:test";
import assert from "node:assert/strict";
import { Role, ResourceKind, RealmKind } from "../../core/identity-enums.js";
import { Grant } from "../../core/grant.js";
import { ResourceRef } from "../../core/resource-ref.js";
import { Realm } from "../../core/realm.js";
import { FakeRoleGrantStore } from "../fakes.js";

class GrantFixture
{
    public static Realm(): Realm
    {
        return new Realm("t1", RealmKind.Saas, "t1");
    }

    public static Grant(subject: string, role: Role): Grant
    {
        return new Grant(subject, role, new ResourceRef(ResourceKind.Realm, "t1", []));
    }
}

test("FakeRoleGrantStore.Revoke removes the matching grant and leaves others", async () =>
{
    const store = new FakeRoleGrantStore();
    await store.Save(GrantFixture.Grant("u1", Role.Owner));
    await store.Save(GrantFixture.Grant("u1", Role.Viewer));

    await store.Revoke(GrantFixture.Grant("u1", Role.Owner));

    const remaining = await store.GrantsFor("u1", GrantFixture.Realm());
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0]!.Role, Role.Viewer);
});

test("FakeRoleGrantStore.Revoke is a no-op when no grant matches", async () =>
{
    const store = new FakeRoleGrantStore();
    await store.Save(GrantFixture.Grant("u1", Role.Viewer));

    await store.Revoke(GrantFixture.Grant("u1", Role.Owner));

    const remaining = await store.GrantsFor("u1", GrantFixture.Realm());
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0]!.Role, Role.Viewer);
});

test("FakeRoleGrantStore.GrantsOn returns only the queried realm's realm-root grants", async () =>
{
    const store = new FakeRoleGrantStore();
    await store.Save(new Grant("a1", Role.Admin, new ResourceRef(ResourceKind.Realm, "t1", [])));
    await store.Save(new Grant("o1", Role.Owner, new ResourceRef(ResourceKind.Realm, "t1", [])));
    await store.Save(new Grant("a2", Role.Admin, new ResourceRef(ResourceKind.Realm, "t2", [])));
    await store.Save(new Grant("p1", Role.Admin, new ResourceRef(ResourceKind.Project, "t1", ["proj"])));

    const onRoot = await store.GrantsOn(new ResourceRef(ResourceKind.Realm, "t1", []));

    assert.deepEqual(onRoot.map((g) => g.Subject).sort(), ["a1", "o1"]);
    const onProject = await store.GrantsOn(new ResourceRef(ResourceKind.Project, "t1", ["proj"]));
    assert.deepEqual(onProject.map((g) => g.Subject), ["p1"]);
});
