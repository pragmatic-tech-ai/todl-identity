import { ServiceKey } from "@pragmatic-tech-ai/todl-runtime";

export interface IPasswordHasher
{
    /** Returns a self-describing PHC string. */
    Hash(password: string): Promise<string>;
    /** False (never throws) when the stored value is malformed. */
    Verify(password: string, stored: string): Promise<boolean>;
}

export const PasswordHasherKey = new ServiceKey<IPasswordHasher>("PasswordHasher");
