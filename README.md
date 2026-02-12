# Fastbreak Events

Sports event management dashboard - Next.js 15, Supabase, Shadcn UI.

## Architecture Decisions

- **Server Actions over API Routes** - Smaller bundle, no network waterfall, works without JS
- **All DB calls server-side** - Keys hidden, RLS enforced
- **Server-side filtering** - Pagination ready, results always fresh

## Future Optimization

React Query for client-side caching - currently every navigation refetches.

## Setup

```bash
npm install
npm run dev
```

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```
