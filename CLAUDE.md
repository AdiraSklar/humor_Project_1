# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

The app lives entirely in `my-next-app/`. All commands below should be run from that directory.

## Commands

```bash
cd my-next-app

npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint via next lint
```

There are no tests configured in this project.

## Environment

Requires `my-next-app/.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Architecture

**Framework:** Next.js App Router with TypeScript, Tailwind CSS v4, React Compiler enabled (`reactCompiler: true` in `next.config.ts`).

**Auth:** Supabase Google OAuth with PKCE flow. The callback handler is at `src/app/auth/callback/route.ts`. Auth state is checked server-side on every protected route via `supabase.auth.getUser()`.

**Supabase clients:**
- `src/utils/supabase/server.ts` — for Server Components and Server Actions (uses `next/headers` cookies)
- `src/utils/supabase/client.ts` — for Client Components (browser-side)

**Page structure / routing:**
- `/` — Sign-in landing page; auto-redirects to `/protected/captions` if already authenticated
- `/protected` — University majors browser (server-fetches `university_majors` table)
- `/protected/captions` — Main caption rating feature (the primary user flow)
- `/auth/callback` — PKCE code exchange, redirects to `/protected/captions` on success

**Caption rating flow:**
1. Server page (`captions/page.tsx`) fetches 300 public captions, shuffles them (Fisher-Yates), takes 50, then fetches their associated images in chunks
2. Only captions with a resolvable image URL are passed to the client
3. `CaptionsPage.tsx` (client component) renders a swipe-style card deck with thumbs up/down buttons
4. Votes are submitted via the `handleVote` Server Action in `captions/actions.ts`
5. **Critical:** Do NOT call `revalidatePath` in `handleVote` — it triggers a full re-fetch and reshuffles the deck mid-session
6. Vote idempotency: tries `INSERT` first; on unique constraint violation (Postgres error code `23505`), falls back to `UPDATE`

**DB tables used:** `captions`, `images`, `caption_votes`, `university_majors`

**UI libraries:** `framer-motion` for card animations, `lucide-react` for icons.