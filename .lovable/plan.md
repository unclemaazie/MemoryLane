## Memory Lane — private family archive

A warm, emotional memory archive for you, your wife, your mum, and your dad. Everyone signs in and sees the same shared collection of photos, videos, and notes about your son.

### Look & feel
- Palette: Warm Sand — `#faf8f5` background, `#f0ebe3` surface, `#c9b99a` accent, `#8b7355` ink
- Type: Cormorant Garamond (headings, italic accents) + Karla (body/UI)
- Tone: nostalgic, film warmth, generous whitespace, soft fades

### Access model
- Email + password sign-in (Lovable Cloud)
- Invite-only: only approved emails can see/upload memories
- You are the **owner** — you invite wife, mum, and dad from a simple Family page (add by email). They sign up with that email and get instant access.
- Everyone in the family can view, upload, and edit memories. Only the owner can manage the invite list.
- Each memory shows who added it ("Added by Mum · 3 May 2026")

### Core features
1. **Upload** photos, videos, or text notes — title, date (defaults today), caption, tags
2. **Shared library** — one collection everyone sees
3. **Four switchable layouts** with the choice remembered:
   - Timeline (chronological, grouped by month/year)
   - Masonry (staggered scrapbook grid)
   - Magazine (featured hero + grid)
   - Gallery (uniform polaroid thumbnails)
4. **Memory detail view** — full-bleed media, caption, date, author
5. **Filter** by year, tag, or author
6. **Edit / delete** your own memories (owner can edit/delete any)

### Technical details
- Lovable Cloud tables:
  - `profiles` (id, display_name, avatar) auto-created on signup
  - `family_invites` (email, invited_by) — gates who can sign up
  - `memories` (id, author_id, kind, title, body, media_path, taken_at, tags[], created_at)
- RLS: only users whose email is in `family_invites` (or the owner) can read/write memories
- Private storage bucket `memories` with signed URLs for display
- Routes: `/login`, `/` (library + layout switcher), `/memory/$id`, `/upload`, `/family` (owner-only invite manager)
- Cormorant + Karla via `@fontsource`, Warm Sand tokens in `src/styles.css`

Approve to build, or tell me what to change (e.g. let mum/dad only view, not upload).