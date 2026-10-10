// A minimal entity view for phase 2. Phase 3 compiles real predicates against the
// model graph; here EntityPredicate is the seam type those will implement.
export interface EntityView
{
    Member(name: string): unknown;
}

export interface EntityPredicate
{
    Matches(entity: EntityView): boolean;
}
