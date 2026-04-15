# AgentAuth

A portfolio demo showing unified human + AI agent identity management with Auth0.

Most identity demos only cover human login. AgentAuth treats AI agents as first-class identity holders, each with their own credentials, scopes, and audit trail, alongside regular users, all visible in one place.

**Live demo:** [here](agent-auth-rouge.vercel.app)

---

## What it demonstrates

| Concept | Implementation |
|---|---|
| Human login | OIDC Authorization Code + PKCE via Auth0 |
| AI agent identity | OAuth2 Client Credentials (M2M) grant |
| Scope-based authorization | `data:read` / `data:write` enforced server-side |
| Unified audit trail | Auth0 logs + internal scope events merged in real time |

---

## Screens

### 1. Human Login
Log in with Auth0. See your decoded ID token, claims, and assigned role (admin / user).

### 2. AI Agent Panel
Two machine identities with different scopes:
- **Agent Reader** (`data:read` only) — write attempts are blocked
- **Agent Writer** (`data:read` + `data:write`) — full access

Authenticate each agent to get a real JWT, then try Read/Write actions. Results (allow / deny) are shown inline and logged to the audit trail.

### 3. Identity Audit Log
A unified timeline of every event: human logins, agent token grants, allowed actions, and denied actions. Shows actor type, outcome, and timestamp. Filters by All / Human / Agent / Denied. Auto-refreshes every 15 seconds.

---

## Tech stack

- **Next.js** (App Router): full-stack, API routes keep secrets off the browser
- **Auth0**: OIDC for humans, M2M client credentials for agents, Management API for logs
- **`@auth0/nextjs-auth0` v4**: middleware-based session management
- **Tailwind CSS** + **shadcn/ui**: clean, minimal UI
- **File-based audit log**: scope enforcement events persisted across server restarts

---

## Auth0 setup

You need four Auth0 applications and one API. This takes about 10 minutes.

### 1. Create an API

In your Auth0 dashboard, go to **Applications > APIs > Create API**

- Name: `AgentAuth API`
- Identifier (audience): `https://agentauth.example.com/api` (use anything, just copy it into `AUTH0_AUDIENCE`)
- Add two custom scopes under **Permissions**: `data:read`, `data:write`

### 2. Regular Web App (human login)

Go to **Applications > Create Application > Regular Web Application**

- Allowed Callback URLs: `http://localhost:3000/auth/callback`
- Allowed Logout URLs: `http://localhost:3000`
- Note the **Domain**, **Client ID**, and **Client Secret**

### 3. M2M App: Agent Reader

Go to **Applications > Create Application > Machine to Machine**

- Authorize it for the `AgentAuth API` with only `data:read`
- Note the **Client ID** and **Client Secret**

### 4. M2M App: Agent Writer

Same as above but authorize with both `data:read` and `data:write`.

### 5. M2M App: Management API

Go to **Applications > Create Application > Machine to Machine**

- Authorize it for the **Auth0 Management API** with the `read:logs` permission
- Note the **Client ID** and **Client Secret**

---

## Local setup

```bash
git clone https://github.com/reetbatra/agent-auth
cd agent-auth
npm install
cp .env.example .env.local
# Fill in .env.local with your Auth0 credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description |
|---|---|
| `AUTH0_DOMAIN` | Your Auth0 tenant, e.g. `dev-abc.us.auth0.com` |
| `AUTH0_CLIENT_ID` | Regular web app client ID |
| `AUTH0_CLIENT_SECRET` | Regular web app client secret |
| `AUTH0_SECRET` | Random 32-char string (run `openssl rand -hex 32`) |
| `AUTH0_AUDIENCE` | API identifier you set in step 1 |
| `APP_BASE_URL` | `http://localhost:3000` locally, your Vercel URL in prod |
| `AUTH0_READER_CLIENT_ID` | Agent Reader M2M client ID |
| `AUTH0_READER_CLIENT_SECRET` | Agent Reader M2M client secret |
| `AUTH0_WRITER_CLIENT_ID` | Agent Writer M2M client ID |
| `AUTH0_WRITER_CLIENT_SECRET` | Agent Writer M2M client secret |
| `AUTH0_MGMT_CLIENT_ID` | Management API M2M client ID |
| `AUTH0_MGMT_CLIENT_SECRET` | Management API M2M client secret |

---

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Add all environment variables from the table above
4. Set `APP_BASE_URL` to your Vercel deployment URL
5. Add the Vercel URL to **Allowed Callback URLs** and **Allowed Logout URLs** in your Auth0 app settings
