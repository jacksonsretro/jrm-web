# Jacksons Retro Manager Web v0.1.0

First web build of JRM. It uses the existing Supabase project and database.

## Included

- Responsive branded homepage
- User dropdown loaded from `list_login_users()` in Supabase
- Existing CJ/TJ password sign-in
- Existing profile/role lookup
- Remembered browser sessions
- Passkey sign-in and enrolment
- TOTP authenticator enrolment and login challenge
- GitHub Pages deployment workflow
- Dashboard foundation for the inventory conversion

## Run locally

Install Node.js 22, then open a terminal in this folder:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Publish with GitHub Desktop

1. Copy these files into the local `jrm-web` repository folder.
2. Commit all files in GitHub Desktop.
3. Push to `main`.
4. In GitHub, open **Settings → Pages**.
5. Under **Build and deployment**, choose **GitHub Actions**.
6. Open the repository **Actions** tab and wait for the deployment to complete.

Expected production URL:

```text
https://jacksonsretro.github.io/jrm-web/
```

## Supabase URL settings

In **Supabase → Authentication → URL Configuration** set:

```text
Site URL:
https://jacksonsretro.github.io/jrm-web/

Additional Redirect URLs:
http://localhost:5173/**
https://jacksonsretro.github.io/jrm-web/**
```

## Enable passkeys

Passkeys are currently experimental in Supabase and require `@supabase/supabase-js` 2.105.0 or newer. This project opts in at client creation.

In **Supabase → Authentication → Passkeys**:

```text
Enable Passkey authentication: ON
Relying Party Display Name: Jacksons Retro Manager
Relying Party ID: jacksonsretro.github.io
Relying Party Origins:
https://jacksonsretro.github.io,http://localhost:5173
```

Do not set the RP ID to include `https://` or `/jrm-web/`. Passkeys are tied to the RP ID. Changing it later invalidates existing passkeys.

After a normal password sign-in, open the cog and choose **Security settings**, then add a passkey.

## Authenticator apps

TOTP works with standards-compatible apps such as Microsoft Authenticator, Google Authenticator, Authy, 1Password and others. It is enabled in Supabase by default.

After a normal password sign-in:

1. Open the cog.
2. Choose **Security settings**.
3. Select **Add authenticator**.
4. Scan the QR code.
5. Enter the six-digit code.

On future password logins, JRM asks for the authenticator code when a verified factor exists.

## Important

The current JRM accounts still use internal Supabase Auth emails such as `cj@users.jacksonsretro.local`. The web login keeps the familiar CJ/TJ dropdown and translates the username internally.

The Supabase project URL and publishable key are browser-safe identifiers. Never add the service-role/secret key, database password, Brevo key or SMTP credentials to this repository.
