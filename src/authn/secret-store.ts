import { ServiceKey } from "@pragmatic-tech-ai/todl-runtime";

export interface ISecretStore
{
    /** Null when absent; never throws for absence. */
    Get(reference: string): Promise<string | null>;
    Put(reference: string, secret: string): Promise<void>;
    Delete(reference: string): Promise<void>;
}

export const SecretStoreKey = new ServiceKey<ISecretStore>("SecretStore");
