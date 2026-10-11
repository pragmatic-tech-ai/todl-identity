import type { ISecretStore } from '../authn/secret-store.js'
import type { ILocalAccountStore } from '../authn/local-account-store.js'
import type { IPrincipalDirectory } from '../authn/principal-directory.js'
import type { IServiceTokenStore } from '../authn/service-token-store.js'
import type { ISessionManager } from '../authn/session-manager.js'
import type { IRoleGrantStore } from '../authn/role-grant-store.js'
import type { IAuditSink } from './audit-sink.js'

/** The persistent store set an identity pack is built over. A platform (file-backed, DB-backed, …)
 *  produces one; ServerIdentityPack.OpenWith consumes it. Accounts must satisfy both the write
 *  (ILocalAccountStore) and read (IPrincipalDirectory) contracts the pack's authenticators need. */
export interface IdentityStoreSet
{
    readonly Secrets: ISecretStore
    readonly Accounts: ILocalAccountStore & IPrincipalDirectory
    readonly Tokens: IServiceTokenStore
    readonly Sessions: ISessionManager
    readonly Grants: IRoleGrantStore
    readonly Audit: IAuditSink
}
