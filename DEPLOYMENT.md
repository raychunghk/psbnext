# PSB — IIS Deployment (single combined `/next` app)

This document describes how to deploy the whole PSB stack to a Windows / IIS
server as **one** IIS application:

- **Base server** – the IIS web site (host name `psbiis`, HTTPS) that owns the
  root binding.
- **Frontend (Next.js)** – served by a single IIS application at `/next`, run by
  the **HttpPlatformHandler** (`next start`).
- **Backend (NestJS)** – runs as a **local Node process** on `localhost:5000`
  (a Windows service, *not* a separate IIS application). The Next.js server
  proxies API calls to it.

There is **no second IIS app** for the API anymore. The Next server proxies
`/next/api2/*` to the local Nest process, so you only configure one IIS app.

---

## 1. Request flow (how the pieces connect)

```
Browser
  |  GET https://psbiis/next/events                     (page)
  |  GET https://psbiis/next/api2/psb/events            (data; from getApiUrl())
  v
IIS site "psbiis"  ──/next/*──►  IIS app "/next"  ──►  HttpPlatformHandler
                                                        └─► node next start  (port = %HTTP_PLATFORM_PORT%)
                                                              |
                                     rewrite  /next/api2/:path*  ─►  http://localhost:5000/api2/:path*
                                                              v
                                                        NestJS backend  (localhost:5000, global prefix "api2")
```

Key facts that make this work:

- `lib/config.ts` → `getApiUrl()` returns a **relative** path `"/next/api2"`.
  The browser therefore always calls the **same origin** (`https://psbiis`);
  there is no `NEXT_PUBLIC_API_URL` and **no production/development switch** in
  the client anymore.
- `next.config.mjs` → `rewrites()` proxies `/api2/:path*` (which becomes
  `/next/api2/:path*` because of `basePath: '/next'`) to
  `http://localhost:5000/api2/:path*`. This proxy runs **server‑side** inside the
  Next process, so the browser never talks to the backend directly and **no CORS
  configuration is needed** on Nest.

> ⚠️ **Most important gotcha:** Next.js evaluates `rewrites()` at **build time**
> and bakes the destination into `.next/routes-manifest.json`. It is **not**
> re-read at runtime. Setting `API_TARGET`/`NEXT_PUBLIC_*` in `web.config` at
> runtime does **not** change where the API is proxied — you must set it (if you
> need a non-default) **before `next build`**. The default
> `http://localhost:5000/api2` is baked in with a plain `npm run build`, so for
> the standard setup you don't need any env var at all.

Verify what got baked after a build:

```powershell
type .next\routes-manifest.json   # look at "afterFiles" -> destination
```

Expected:

```json
{ "source": "/next/api2/:path*", "destination": "http://localhost:5000/api2/:path*" }
```

---

## 2. Prerequisites (install once on the server)

1. **IIS** with these role services: *Web Server*, *Static Content*,
   *WebSocket Protocol* (Next uses it in some cases).
2. **HttpPlatformHandler** module (required by the `web.config` below):
   download from Microsoft ("HttpPlatformHandler v1.2") and install. Confirm it
   appears under *IIS Manager → server → Modules* and *Handler Mappings*.
3. **Node.js** at a fixed path. The current `web.config` points at
   `D:\ASD\nodejsv2418\node.exe` — keep Node there or update the two paths in the
   `web.config`.
4. **URL Rewrite** module is *not* required (the Next server does the API
   proxying), but it's fine to have it installed.
5. An **HTTPS binding** on the site for host `psbiis` with a valid/trusted
   certificate (the frontend is served over `https://psbiis`).

---

## 3. Folder layout on the server

Using the paths already referenced by your `web.config`:

```
D:\ASD\nodejsv2418\node.exe                     <- Node runtime
D:\ASD\PSBIIS\psb\psbnode\frontend\             <- IIS app "/next" physical path
     ├─ .next\                                   (build output)
     ├─ node_modules\                            (prod install)
     ├─ public\
     ├─ package.json
     ├─ next.config.mjs
     ├─ web.config                               (the Next web.config)
     └─ logs\next.log                            (stdout log)
D:\ASD\PSBIIS\psb\psbnode\backend\              <- NestJS build (dist + node_modules)
     ├─ dist\main.js
     ├─ node_modules\
     ├─ package.json
     └─ logs\
```

---

## 4. Build & publish the **frontend** (Next.js)

Do this on a build machine (or on the server). The `next start` model in the
provided `web.config` needs `.next`, `node_modules`, `public`, `package.json`
and `next.config.mjs` present.

```powershell
# in the repo
npm ci
npm run build          # bakes rewrite -> http://localhost:5000/api2

# confirm the baked destination
type .next\routes-manifest.json
```

Copy to the server app folder (`D:\ASD\PSBIIS\psb\psbnode\frontend`):

- `.next\`
- `public\`
- `package.json`, `package-lock.json`
- `next.config.mjs`
- `web.config`
- `node_modules\`  (or run `npm ci --omit=dev` in the target folder instead of copying)

> If the backend does **not** listen on `localhost:5000`, build with an override
> **before** `next build`:
> ```powershell
> $env:API_TARGET="http://localhost:5050/api2"; npm run build
> ```

### `web.config` for the `/next` app

Your existing file works. The only cleanup: `NEXT_PUBLIC_API_URL` is **no longer
used** (client uses a relative URL) and the rewrite target is baked at build
time, so those env vars have no effect at runtime. You can safely trim it to:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <clear />
      <add name="httpPlatformHandler_Next" path="*" verb="*"
           modules="httpPlatformHandler" resourceType="Unspecified" />
    </handlers>
    <httpPlatform processPath="D:\ASD\nodejsv2418\node.exe"
                  arguments=".\node_modules\next\dist\bin\next start -p %HTTP_PLATFORM_PORT%"
                  stdoutLogEnabled="true"
                  stdoutLogFile="D:\ASD\PSBIIS\psb\psbnode\frontend\logs\next.log"
                  startupTimeLimit="60">
      <environmentVariables>
        <environmentVariable name="PORT"     value="%HTTP_PLATFORM_PORT%" />
        <environmentVariable name="NODE_ENV" value="production" />
        <!-- basePath is hard-coded in next.config.mjs; keep only if you rely on it elsewhere -->
        <environmentVariable name="NEXT_PUBLIC_BASE_PATH" value="/next" />
      </environmentVariables>
    </httpPlatform>
  </system.webServer>
</configuration>
```

---

## 5. Build & run the **backend** (NestJS) as a local service

The backend is a plain Node process on `localhost:5000`. It must:

- listen on **port 5000** (or match `API_TARGET`),
- bind to **localhost** only (it must not be publicly reachable — only Next
  proxies to it),
- expose a **global prefix `api2`** so routes are `/api2/psb/events`, matching the
  rewrite destination.

In the Nest `main.ts` this looks like:

```ts
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('api2');           // -> /api2/psb/...
await app.listen(5000, '127.0.0.1');   // localhost only
```

Build and install dependencies on the server:

```powershell
cd D:\ASD\PSBIIS\psb\psbnode\backend
npm ci --omit=dev
npm run build            # produces dist\main.js
```

Run it as a **Windows service** so it starts on boot and restarts on crash.
Pick one of:

**Option A – NSSM (simple):**

```powershell
nssm install psb-backend "D:\ASD\nodejsv2418\node.exe" "D:\ASD\PSBIIS\psb\psbnode\backend\dist\main.js"
nssm set psb-backend AppDirectory "D:\ASD\PSBIIS\psb\psbnode\backend"
nssm set psb-backend AppStdout "D:\ASD\PSBIIS\psb\psbnode\backend\logs\out.log"
nssm set psb-backend AppStderr "D:\ASD\PSBIIS\psb\psbnode\backend\logs\err.log"
nssm set psb-backend AppEnvironmentExtra NODE_ENV=production PORT=5000
nssm start psb-backend
```

**Option B – pm2 + pm2-windows-startup:**

```powershell
npm i -g pm2 pm2-windows-startup
pm2-startup install
pm2 start dist\main.js --name psb-backend
pm2 save
```

Smoke-test it locally on the server:

```powershell
curl http://localhost:5000/api2/psb/events   # should return JSON, not 404/refused
```

---

## 6. Configure IIS (the "base server" + `/next` app)

1. **Site (base server):** In IIS Manager create/confirm the site bound to
   `https://psbiis` (port 443, host name `psbiis`, your certificate). Its
   physical path can be an empty landing folder (e.g. `D:\ASD\PSBIIS\wwwroot`).
2. **Application `/next`:** right‑click the site → *Add Application*.
   - Alias: `next`
   - Physical path: `D:\ASD\PSBIIS\psb\psbnode\frontend`
   - Application pool: a dedicated **No Managed Code** pool (e.g.
     `psb-next`), *Identity* = an account that can read the app folder and
     write `logs\`.
3. **Permissions:** grant the app-pool identity (e.g.
   `IIS AppPool\psb-next`) *Read/Execute* on the frontend folder and *Modify* on
   `logs\`. Grant the backend service account *Read/Execute* on the backend
   folder and *Modify* on its `logs\`.
4. Recycle the pool / restart the site.

Browse to `https://psbiis/next` → the app loads; `https://psbiis/next/events`
lists events fetched through the proxy.

---

## 7. Deployment checklist (each release)

1. `npm ci && npm run build` (frontend) — confirm `routes-manifest.json`.
2. Build backend `npm ci --omit=dev && npm run build`.
3. Stop backend service, copy backend files, start backend service.
4. Copy frontend files to `...\frontend`.
5. Recycle the `psb-next` app pool (or run the helper below).

The repo's `scripts/deploy.ts` recycles the pool via `appcmd`. Update the pool
name in it (`NextJS-AppPool` → your `psb-next`) if you use it.

---

## 8. Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| **API calls 404 / go to the wrong host** | The rewrite is baked at **build time**. Rebuild after changing `API_TARGET`; verify `.next\routes-manifest.json`. Runtime env vars in `web.config` do **not** change it. |
| **`502.5 - Process Failure`** | HttpPlatformHandler couldn't start Node. Check `logs\next.log`, verify `processPath` (`node.exe`) and that `node_modules\next\dist\bin\next` exists in the app folder. |
| **`HTTP Error 500.19`** | HttpPlatformHandler module not installed, or `web.config` references a module IIS doesn't have. Install HttpPlatformHandler. |
| **Page loads but data fails (`ECONNREFUSED`)** | Backend not running / wrong port. `curl http://localhost:5000/api2/...` on the server; check the backend service + logs. |
| **API returns 404 from the backend** | Nest global prefix missing. Ensure `app.setGlobalPrefix('api2')` so paths are `/api2/psb/...`. |
| **Assets/links break, 404 on `/_next/...`** | `basePath` mismatch. The app must be the IIS application at alias `next` and `basePath: '/next'` must match. |
| **Works on `/next` but not root** | By design the app lives under `/next`. Add a root redirect on the site if you want `https://psbiis/` → `/next`. |
| **Backend reachable from outside** | It must bind to `127.0.0.1` only. Do not add an IIS app or public binding for the backend. |
| **Old behavior returns after redeploy** | Stale `.next`. Run `npm run clean` (or delete `.next`) then rebuild. |

### Enable request logging
`lib/api.ts` and `app/events/page.tsx` already `console.log` the resolved URL.
`next.config.mjs` logs the baked rewrite target at build time
(`[psbnext] rewrite /api2/* -> ...`). Check `logs\next.log` for the Next process
and the backend service logs for the API side.
