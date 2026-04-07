## Context

The `will-navigate` handler in `WebviewManager` intercepts any navigation whose destination origin differs from the profile's configured URL and shows the "Open Link" dialog. This is correct for genuine external links, but it also fires for internal service navigations — such as Teams' auth redirect to `https://teams.cloud.microsoft/=loginHint=<username>` — producing a blocking dialog on every startup for every Teams account.

The fix is to allow providers to declare a set of trusted domain patterns. Navigations to those domains are treated as internal and pass through silently.

## Goals / Non-Goals

**Goals:**
- Eliminate spurious Open Link dialogs for Teams' own Microsoft-owned domains on startup.
- Keep the mechanism generic so other providers can also declare trusted domains if needed.
- Introduce no behavioral change for origins that are not trusted.

**Non-Goals:**
- Suppressing the dialog for all Microsoft URLs (only trusted domains explicitly declared by the provider).
- Changing the link-open-choice UX or popup-window behavior.
- Adding runtime configuration of trusted domains by the user.

## Decisions

### Pattern matching for trusted domains

**Decision:** Use glob-style wildcard prefix matching (e.g. `*.microsoft.com`) checked against the destination hostname.

**Rationale:** A simple `hostname.endsWith('.microsoft.com')` check is readable, has no new dependencies, and covers all subdomains. Alternatives:
- Regex per domain: more flexible but harder to read and easy to mis-write.
- Exact-origin list: too brittle; Microsoft auth uses many subdomains.

### Where to declare trusted domains

**Decision:** Add an optional `trustedDomains: string[]` field to `CommunicationProvider` (in `src/shared/types.ts`).

**Rationale:** Keeps domain policy co-located with the provider definition rather than scattered in the renderer or main process. The `will-navigate` handler already has access to the profile's `providerId` and can resolve the provider.

### Scope of bypass

**Decision:** Trusted domain check applies only in the `will-navigate` handler (startup/SPA navigations). The `new-window` handler (explicit `<a target="_blank">`) is **not** bypassed.

**Rationale:** `new-window` represents an explicit user gesture to open a link; `will-navigate` fires during programmatic navigation. Teams' login redirects fire via `will-navigate`, not `new-window`.

## Risks / Trade-offs

- **Overly-broad trust** → If a trusted domain is too wide (e.g. `*.com`) it could suppress legitimate link dialogs. Mitigation: keep the Teams list to specific Microsoft-owned TLDs and review each entry.
- **Future provider authors** may add overly permissive trusted domains. This is a low risk given the small number of providers and in-repo review.

## Migration Plan

No data migration required. The change is purely additive (new optional field, updated handler logic). No rollback needed — reverting the three file changes restores prior behaviour.
