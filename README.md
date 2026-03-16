# Tartagureto Beach 2026

A group trip planning webapp where friends vote on destinations, budget, and timing together.

## Live

Deployed on Vercel: `tartagureto.vercel.app`

## How It Works

1. **Enter password** (`tartagureto`) to access the trip
2. **Pick your name** from the 12-member list (Veve, Ari, Franky, Marta, Zappy, Alis, Manu, Arma, Guido, Teo, Andre, Dave)
3. **Vote** across 4 sections:
   - **Mete** — 7 predefined Italian beach destinations + custom proposals with Unsplash image search
   - **Budget** — Per-night budget preference (50-100, 100-150, 150-200, 200+)
   - **Quando** — Weekend type (2/3/4 days) + month (June-September)
   - **Risultati** — Live results with winner cards, destination ranking, and celebration overlay

## Admin Panel

Access via the gear icon in the trip header, login with `admin` / `admin`.

- **Member management** — Add, remove, or merge duplicate members (transfers all votes)
- **Custom destinations** — Rename or delete user-proposed destinations
- **Vote summary** — Overview of vote counts per category
- **Danger zone** — Reset all votes or delete the trip

## Tech Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **Supabase** (PostgreSQL) — trips, members, proposals, votes tables
- **Unsplash API** — Image search for custom destination proposals
- **Vercel** — Auto-deploy from GitHub

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=<unsplash-access-key>
```

These must be set both in `.env.local` (local dev) and in Vercel environment variables (production).

## Project Structure

```
src/
  app/
    page.tsx                    # Homepage (password + name picker)
    trip/[code]/page.tsx        # Main trip page (voting sections)
    admin/[code]/page.tsx       # Admin panel
  components/
    DestinationCard.tsx         # Predefined destination card
    CustomDestinationCard.tsx   # User-proposed destination card
    DestinationModal.tsx        # Destination detail modal
    AddDestination.tsx          # Custom destination proposal form
    BudgetVoting.tsx            # Budget voting section
    WhenVoting.tsx              # When voting section (weekend + month)
    Results.tsx                 # Results with rankings and celebration
    MembersList.tsx             # Horizontal members display
    AdminMembers.tsx            # Admin member management + merge
    AdminDestinations.tsx       # Admin custom destination management
    ShareButton.tsx             # Share button (currently unused)
  lib/
    supabase.ts                 # Supabase client
    types.ts                    # TypeScript types + DB mappings
    destinations-data.ts        # 7 predefined Italian destinations
    voting-options.ts           # Budget, weekend, month options
    unsplash.ts                 # Unsplash API search
    utils.ts                    # Session management, helpers
```

## DB Schema (existing Supabase tables)

- **trips** — `id, name, code, admin_password, created_at`
- **members** — `id, trip_id, name, avatar_color, is_admin, created_at`
- **proposals** — `id, trip_id, member_id, type, title, description, created_at`
- **votes** — `id, proposal_id, member_id, vote, created_at`

Vote categories map to proposal types: `destination→destination`, `budget→budget`, `weekend_type→date`, `month→activity`.

Custom destinations store the Unsplash image URL in the `description` field.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # Production build
```
