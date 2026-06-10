# Karektar Platform Migration Plan

This file is an internal migration note and should stay uncommitted unless we
intentionally decide to publish the migration plan.

## Branch Strategy

`main` remains the v1 frontend source of truth and the production release base.

Use a staging integration branch for the multi-PR platform migration:

- `feature/platform-foundation`: staging branch for the rebuild stack.
- `feature/account-draft`: PR 2, branched from `feature/platform-foundation`.
- `feature/project-management`: PR 3, branched from the updated staging branch.
- `feature/project-data-model-v2`: PR 4, branched from the updated staging branch.

Each feature PR should target `feature/platform-foundation` until the stack is
validated together. After the full stack is validated, open one final PR from
`feature/platform-foundation` into `main`.

Reasoning:
- The migration introduces intermediate states that are useful for review but
  may not be the final product shape.
- The staging branch lets us validate cumulative behavior without repeatedly
  exposing half-finished platform states on `main`.
- `feature/platform-foundation` is more descriptive than `feature/v2`; it
  describes the work as an incremental platform foundation rather than a broad
  frontend rewrite.

Keep `draft/v2-overhaul` as reference-only. Do not merge it as-is.

## PR 1: `feature/login-auth`

Scope:
- Google OAuth start, callback, auth check, logout, and session storage.
- Minimal v1-style login/logout/account affordance.
- Signed-out editor usage remains unchanged.

Out of scope:
- Account draft persistence.
- Multiple projects.
- Zustand.
- Donor `frontend/` architecture.

Session behavior:
- Authenticated sessions use an HttpOnly `session` cookie with a 7-day `Max-Age`.
- The matching KV session record uses the same 7-day TTL.
- Refresh persistence is covered by the cookie plus KV session lookup.
- This PR intentionally uses fixed expiration, not sliding renewal. Users sign in again after the session expires.
- Sliding session renewal can be considered later if the product needs "stay signed in while active" behavior.

HITL validation:
- Sign in with Google.
- Refresh and confirm the session persists.
- Log out and confirm the session clears.
- Confirm the unsigned editor still works.

Validated:
- `feature/login-auth` merged into `main`.
- Preview deployment validated at `https://feature-login-auth.karektar.pages.dev/`.

Auth environment setup:
- Production Cloudflare Pages binding: `MY_KV` -> `karektar-prod-MY_KV`.
- Preview Cloudflare Pages binding: `MY_KV` -> `karektar-preview-MY_KV`.
- Production OAuth client: `Karektar Prod`.
- Preview OAuth client: `Karektar Preview`.
- Local OAuth client: `Karektar Dev`.
- Local full-stack validation uses `npm run dev:auth` and `http://localhost:8788`.
- No remote dev KV namespace is required for local auth; Wrangler local KV is enough.

Production OAuth redirect URIs:
- `https://karektar.pages.dev/api/auth/callback`
- `https://karektar.newtrino.ink/api/auth/callback`

Preview OAuth redirect URI pattern:
- Google does not accept wildcards, so add concrete preview callback URLs as needed.
- Example: `https://feature-login-auth.karektar.pages.dev/api/auth/callback`.

Cloudflare build settings:
- Root directory: `/`.
- Build command: `npm run build`.
- Build output directory: `dist`.
- Do not use `frontend/dist`; that belonged to the donor transplant shape.
- Keep Cloudflare dashboard config as the source of truth for now. Do not add a
  hand-written `wrangler.toml` with placeholder namespace IDs.

## PR 2: `feature/account-draft`

Target branch:
- `feature/platform-foundation`.

Backend:
- Add one authenticated current draft per user.
- Save and load the current reducer editor state for the logged-in account.
- Keep the storage shape close to the v1 editor state until project management
  and data-model work are introduced.

Frontend:
- Load the account draft after session restoration.
- Save the current editor draft for the authenticated account.
- Preserve the reducer-driven editor as the source of truth.

Out of scope:
- Multi-project UI.
- Project names and project lists.
- Packed bitmap serialization.

HITL validation:
- Sign in.
- Edit the current canvas.
- Save the account draft.
- Refresh and confirm the draft restores.
- Sign out and confirm local in-session editor state is not destroyed.
