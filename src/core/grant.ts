import { Role } from "./identity-enums.js";
import { ResourceRef } from "./resource-ref.js";

export class Grant
{
    public constructor(
        public readonly Subject: string,
        public readonly Role: Role,
        public readonly Resource: ResourceRef,
    )
    {
    }
}
