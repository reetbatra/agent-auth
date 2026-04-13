# AgentAuth — Product Requirements Document

**Last updated:** 2026-04-13  
**Status:** Planning  
**Goal:** Portfolio demo for Okta DevRel / Support Engineer application

---

## Problem Statement

Okta's current strategic bet is *"Secure Every Identity, from AI to Human."* The emerging challenge: AI agents are acting on behalf of users and organizations — fetching data, triggering actions, calling APIs — with no standardized identity or audit trail. Most identity demos only show human login. Nobody shows agents as first-class identity holders.

AgentAuth bridges that gap: a working demo where humans **and** AI agents are both authenticated through Okta, scoped differently, and every action is auditable in one place.

---

## Target Audience (for the demo itself)

- Okta hiring team — DevRel, Support Engineering
- Developers at conferences / blog readers discovering AI agent identity patterns
- Security-minded devs building agentic apps

---

## Core Features

### Screen 1 — Human Login (OIDC)
- User clicks "Login with Okta" → standard OIDC Authorization Code + PKCE flow
- After login: display decoded ID token (claims: name, email, groups)
- Display access token with expiry countdown
- Show assigned role (admin / user) derived from Okta Groups
- Logout button clears session

### Screen 2 — AI Agent Panel (M2M / Client Credentials)
- Two pre-configured agents with distinct Okta M2M app credentials:
  - `agent:reader` — read-only scope (`data:read`)
  - `agent:writer` — read + write scopes (`data:read data:write`)
- UI shows each agent as a "card" with:
  - Agent name + icon
  - Current token status (active / expired)
  - Assigned scopes (visual badges)
  - "Fetch Token" button — triggers client credentials grant, displays resulting JWT
  - Action buttons:
    - "Read Resource" — both agents can do this
    - "Write Resource" — only `agent:writer` can do this; `agent:reader` gets blocked
  - Result shown inline: allowed (green) or denied (red) with reason

### Screen 3 — Identity Audit Log
- Pulls from Okta System Log API (`/api/v1/logs`)
- Unified timeline: human logins, agent token requests, allowed actions, denied actions
- Each entry shows:
  - Actor type: Human / Agent (with icon)
  - Actor name (user email or agent client ID)
  - Event: what happened (`user.session.start`, `app.oauth2.token.grant`, `policy.evaluate_sign_on`, etc.)
  - Timestamp
  - Outcome: Success / Failure (color-coded)
- Auto-refreshes every 15 seconds
- Filter by: All / Human / Agent / Denied

---

## Okta Features Used

| Feature | Where Used |
|---|---|
| OIDC (Authorization Code + PKCE) | Human login (Screen 1) |
| M2M Client Credentials Grant | Agent tokens (Screen 2) |
| Groups / RBAC | Role shown on human profile |
| Custom Scopes | `data:read`, `data:write` on agents |
| System Log API | Audit log (Screen 3) |
| Okta Admin API | Fetching log entries server-side |

---

## Technical Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack, API routes for server-side Okta calls |
| Auth (Human) | `@okta/okta-auth-js` or `next-auth` with Okta provider | PKCE support, session management |
| Auth (Agent) | Direct HTTP `client_credentials` grant (fetch) | Minimal, transparent, easy to inspect |
| Styling | Tailwind CSS | Fast, clean |
| UI Components | shadcn/ui | Polished without heavy overhead |
| System Log | Okta Admin API via server-side route | Keep client secret off browser |
| Deployment | Vercel | Zero-config Next.js |

---

## Phases

### Phase 1 — Scaffold + Human Login
**Goal:** App boots, user can log in with Okta, sees their decoded token and role.

Tasks:
- [ ] `npx create-next-app@latest agentauth` with TypeScript + Tailwind
- [ ] Install `@okta/okta-auth-js`, `shadcn/ui`
- [ ] Create `.env.local` with Okta OIDC app credentials
- [ ] `lib/oktaClient.ts` — OktaAuth instance configured for PKCE
- [ ] `/` home page — hero, "Login with Okta" button
- [ ] `/callback` route — handle OIDC redirect, store tokens
- [ ] `/profile` page — decoded ID token, access token, role from groups, logout

**Done when:** Human can log in and see their identity clearly displayed.

---

### Phase 2 — AI Agent Panel
**Goal:** Two M2M agents with different scopes. Try actions, see allow/deny.

Tasks:
- [ ] Create two Okta M2M apps in dashboard: `AgentAuth Reader`, `AgentAuth Writer`
- [ ] Add custom scopes `data:read`, `data:write` to Authorization Server
- [ ] Assign scopes to each M2M app accordingly
- [ ] `lib/agentAuth.ts` — `fetchAgentToken(clientId, clientSecret)` — client_credentials grant
- [ ] `/api/agent/token` — server-side route, returns agent JWT (never expose secret to browser)
- [ ] `/api/agent/action` — validates agent token + scope, returns allow/deny
- [ ] `/agents` page — two agent cards, token fetch + action buttons, inline results

**Done when:** Reader gets blocked on write, Writer succeeds on both. JWT visibly shown.

---

### Phase 3 — Identity Audit Log
**Goal:** One screen showing every action — human or agent — with outcome.

Tasks:
- [ ] Enable Okta System Log access (confirm Admin API token)
- [ ] `/api/logs` — server-side route, hits `GET /api/v1/logs`, returns parsed entries
- [ ] Parse relevant event types: session start, token grant, policy deny
- [ ] `/audit` page — timeline component, actor icons, color-coded outcomes
- [ ] Auto-refresh every 15s
- [ ] Filter buttons: All / Human / Agent / Denied

**Done when:** A unified, real-time audit view shows human + agent events together.

---

### Phase 4 — Polish + Deploy
**Goal:** Demo-ready. Clean UI, good copy, Vercel deploy.

Tasks:
- [ ] Navigation bar across all 3 screens
- [ ] Loading states, error states, empty states
- [ ] Responsive layout (readable on laptop screen share)
- [ ] README with setup instructions + Okta config steps
- [ ] Deploy to Vercel
- [ ] Record a 2-min Loom walkthrough
- [ ] Add to portfolio / resume

**Done when:** Live URL works, demo is presentable in an interview.

---

## Okta Setup Checklist (Before Coding)

1. **Create Okta Developer Org** — developer.okta.com (free)
2. **OIDC App** — type: Web (or SPA), enable PKCE, set redirect URI to `http://localhost:3000/callback`
3. **Groups** — create `admin` and `user` groups, assign yourself to one
4. **Custom Auth Server** — add `data:read` and `data:write` custom scopes
5. **M2M App #1 (Reader)** — grant `data:read` only
6. **M2M App #2 (Writer)** — grant `data:read` and `data:write`
7. **Admin API Token** — for System Log access from server-side routes

---

## Success Criteria

- [ ] Human login works end-to-end with real Okta org
- [ ] Both agents fetch real M2M tokens from Okta
- [ ] Permission enforcement is real (scope check), not fake
- [ ] Audit log shows real Okta System Log events
- [ ] App is live on Vercel
- [ ] Can walk through all 3 screens in under 3 minutes

---

## Resume / Portfolio Line

> **AgentAuth** — Next.js demo showing unified human + AI agent identity management via Okta. Implements OIDC (PKCE), M2M client credentials, custom scopes, RBAC, and real-time audit logging via System Log API. Demonstrates Okta's AI identity security vision end-to-end.
