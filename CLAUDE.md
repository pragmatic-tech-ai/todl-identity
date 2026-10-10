# CLAUDE.md

todl-identity — `@pragmatic-tech-ai/todl-identity`, the engine-layer identity
management contracts: principal/tenant/session value types and the swappable
provider-pack seams. ESM, strict tsconfig; tests via
`tsx --conditions=development --test "src/**/*.test.ts"`.

## Work tracking

All work — tasks, features, bugs, and design notes — is tracked in the GitHub
Project **Architecture Agentic Suite** (org `pragmatic-tech-ai`, project number
`1`). Work descriptions, backlogs, and TODO lists are **not** stored in local
files. Read and update the backlog with the `gh` CLI:

- List items: `gh project item-list 1 --owner pragmatic-tech-ai`
- Add an item: `gh project item-create 1 --owner pragmatic-tech-ai --title "…" --body "…"`

## Testing

- **Every test file lives in a `tests/` subfolder next to the code it
  exercises** — `src/tests/bootstrap.test.ts`. The runner globs
  `src/**/*.test.ts` either way, so this is organizational.

## Conventions

- OOP: no free functions or module-level mutable state; value types are classes
  with `readonly` fields; real `enum`s, not string-literal unions.
- Allman braces; PascalCase interfaces and public members.
- No inline string literals for reused/user-facing text — hoist to
  `private static readonly` PascalCase constants.
- ESM with explicit `.js` import extensions.
- No secrets on any type, in any log, or in any committed file.

## Single dependency

- The only dependency is `@pragmatic-tech-ai/todl-runtime`. Never pull in the
  `@pragmatic-tech-ai/todl` compiler or any higher layer.
