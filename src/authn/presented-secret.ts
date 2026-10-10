/**
 * A transient in-memory envelope for a raw secret a principal presents.
 * NEVER persisted, serialized, logged, or placed in an AuditEvent.
 */
export class PresentedSecret
{
    private static readonly ClearedMessage = "presented secret already cleared";
    private static readonly Redacted = "[redacted]";

    private value: string | null;

    public constructor(value: string)
    {
        this.value = value;
    }

    public Reveal(): string
    {
        if (this.value === null)
        {
            throw new Error(PresentedSecret.ClearedMessage);
        }
        return this.value;
    }

    public Clear(): void
    {
        this.value = null;
    }

    public toString(): string
    {
        return PresentedSecret.Redacted;
    }

    public toJSON(): string
    {
        return PresentedSecret.Redacted;
    }
}
