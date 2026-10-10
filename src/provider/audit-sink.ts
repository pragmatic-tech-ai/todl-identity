export enum AuditEventKind
{
    Authentication,
    AccessDecision,
    AdminAction,
    ResolutionMerge,
}

export class AuditEvent
{
    public constructor(
        public readonly Kind: AuditEventKind,
        public readonly TenantId: string,
        public readonly PrincipalId: string | null,
        public readonly At: Date,
        public readonly Detail: ReadonlyMap<string, string>,
    )
    {
    }
}

export interface IAuditSink
{
    Record(event: AuditEvent): Promise<void>;
}
