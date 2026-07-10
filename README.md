# Jacksons Retro Manager Web v0.2.0

Static GitHub Pages build connected to the existing Supabase project.

## Deploy

1. Delete or overwrite the current repository contents.
2. Copy `index.html`, `.nojekyll`, and this README into the repository root.
3. Commit and push to `main`.
4. In **Settings → Pages**, use **Deploy from a branch**, `main`, `/ (root)`.
5. Do not add the old Vite GitHub Actions workflow back.

## Included

- Existing CJ/TJ login and persistent session
- Dashboard totals and recent stock
- Inventory list, search and filters
- Create and edit inventory items
- Record sales and profit calculations through Supabase generated columns
- Archive items without deleting historical records
- Watch List create/edit/delete and platform filtering
- Private Supabase Storage attachments under `jrm/<ITEM-ID>/`
- Signed attachment viewing, upload and delete
- Administrative attachment purge for sold/returned stock
- Settings menu and user overview
- Responsive desktop and mobile layout

The Supabase project URL and publishable browser key are intentionally present in the front end. Security must remain enforced by database RLS, Storage policies, and protected Edge Functions. Never place a service-role key, database password, SMTP password, or API secret in this repository.
