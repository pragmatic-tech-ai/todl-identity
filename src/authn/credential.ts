import { AuthMethod } from "../core/identity-enums.js";

export class Credential
{
    public constructor(
        public readonly Method: AuthMethod,
        public readonly Reference: string,
    )
    {
    }
}
