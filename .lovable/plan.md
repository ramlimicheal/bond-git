## What's actually happening

Your Google sign-in **is** succeeding — the auth logs show clean 200s and a new `user_signedup` event for `ya.itsmike@gmail.com` at 15:37:39 UTC. There is no auth failure.

The "loop" is a routing bug:

1. You click **Continue with Google** on `/login`.
2. The Lovable OAuth broker does a full-page redirect to Google, then back to `window.location.origin` — which is `/`.
3. `/` is wired to `<LandingPage />` with **no "already signed in" check**, so the landing page renders again with its "Sign in" / "Get started" buttons.
4. Looks exactly like "it bounced me back to login," but you are signed in. Clicking the sidebar / dashboard URL directly would work.

The `navigate('/dashboard')` inside `Login.tsx` never runs for OAuth because that code path is killed by the full-page redirect to Google.

## Fix

One small change in `App.tsx`: gate the three public routes (`/`, `/login`, `/signup`) with a tiny `RedirectIfAuthed` wrapper that sends signed-in users to `/dashboard` (and waits for `auth.loading` so we don't flicker).

```tsx
function RedirectIfAuthed({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="...">Loading…</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}
```

Then:

```tsx
<Route path="/"       element={<RedirectIfAuthed><LandingPage /></RedirectIfAuthed>} />
<Route path="/login"  element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
<Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />
```

That's it. New Google users will land on `/`, the wrapper sees the session, redirects to `/dashboard`, and `OrgProvider` auto-creates the org (that code already exists in `org.context.tsx` lines 74–86), which then bounces first-time users to `/onboarding`.

## Files touched

- `App.tsx` — add the wrapper, wrap the three public routes.

## Not changing

- `auth.context.tsx`, `Login.tsx`, `org.context.tsx`, the Lovable OAuth integration — all working correctly. The auto-org-create for Google users is already in place.

## Verification after build

1. Open an incognito window → `/` → click **Sign in with Google** → should land on `/dashboard` (or `/onboarding` for a brand-new account), never bounce back to `/login`.
2. Already-signed-in user visiting `/login` directly → redirects to `/dashboard`.
