const InspectCustom = Symbol.for("nodejs.util.inspect.custom");

/**
 * A transient in-memory envelope for a raw secret a principal presents.
 * NEVER persisted, serialized, logged, or placed in an AuditEvent.
 */
export class PresentedSecret
{
    private static readonly ClearedMessage = "presented secret already cleared";
    private static readonly Redacted = "[redacted]";

    #value: string | null;

    public constructor(value: string)
    {
        this.#value = value;
    }

    public Reveal(): string
    {
        if (this.#value === null)
        {
            throw new Error(PresentedSecret.ClearedMessage);
        }
        return this.#value;
    }

    /** Best-effort: JavaScript strings are immutable and may linger in memory until GC. */
    public Clear(): void
    {
        this.#value = null;
    }

    public toString(): string
    {
        return PresentedSecret.Redacted;
    }

    public toJSON(): string
    {
        return PresentedSecret.Redacted;
    }

    public [InspectCustom](): string
    {
        return PresentedSecret.Redacted;
    }
}
