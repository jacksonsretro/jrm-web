# JRM Web v0.1.2 static recovery build

This version intentionally uses a single static `index.html` so GitHub Pages can serve it directly without a Node/Vite build step.

1. Replace the files in the repository with these files.
2. In GitHub repository Settings > Pages, choose **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`.
4. Save and wait for deployment.

This build verifies the existing Supabase user list, password login and profile loading. Passkeys remain visibly reserved for the next build after standard login is verified.
