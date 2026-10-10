import { test } from "node:test";
import assert from "node:assert/strict";
import { ServiceKey } from "@pragmatic-tech-ai/todl-runtime";
import { AuditEvent, AuditEventKind } from "../audit-sink.js";
import { IdentityProviderRegistryKey } from "../identity-provider-registry.js";
import { TenantConfigStoreKey } from "../tenant-config-store.js";

test("audit event carries structured, secret-free detail", () =>
{
    const e = new AuditEvent(
        AuditEventKind.Authentication,
        "t1",
        "p1",
        new Date(0),
        new Map([["method", "Local"], ["outcome", "Authenticated"]]),
    );
    assert.equal(e.Kind, AuditEventKind.Authentication);
    assert.equal(e.PrincipalId, "p1");
    assert.equal(e.Detail.get("method"), "Local");
});

test("service keys are defined for DI resolution", () =>
{
    assert.ok(IdentityProviderRegistryKey instanceof ServiceKey);
    assert.ok(TenantConfigStoreKey instanceof ServiceKey);
});
