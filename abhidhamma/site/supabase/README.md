# Accounts and discussion: setup

The site's accounts, comments and synced reflections use [Supabase](https://supabase.com). The free tier is enough. Setup takes about 15 minutes, once. Until then the site works without it: reflections are kept in the reader's browser, and the discussion says it is not connected.

## 1. Create the project

1. Sign in at supabase.com, choose **New project**, pick a name and a region near your readers, and set a database password. Keep the password somewhere safe; the site never needs it.
2. In **SQL Editor → New query**, paste the whole of [`schema.sql`](schema.sql) and choose **Run**. It creates the tables and the access rules. It is safe to run again after changes.
3. Make yourself an admin, so that you can hide comments. After you have signed in to the site once, run this with your own email:
   ```sql
   update public.profiles set is_admin = true
     where id = (select id from auth.users where email = 'you@example.com');
   ```

## 2. Connect the site

In **Project Settings → API**, copy the **Project URL** and the **anon public** key. Then:

- **On your computer:** copy `.env.example` to `.env` in `abhidhamma/site/` and fill in both values. Restart `npm run dev`.
- **On GitHub Pages:** in the repository, go to **Settings → Secrets and variables → Actions → Variables** and add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`. The workflow passes them to the build.

Both values are meant to be public. The anon key can do only what the access rules in `schema.sql` allow.

## 3. Sign-in methods

In **Authentication → URL Configuration**:
- **Site URL:** set it to where the site lives, e.g. `https://ashikbarua88.github.io/content/`.
- **Redirect URLs:** add both of these:
  - `http://localhost:4321/**`
  - `https://ashikbarua88.github.io/**`

In **Authentication → Providers**:

- **Email:** on by default. Keep **Confirm email** on, so that every account has a real address.
- **GitHub:**
  1. On GitHub, go to **Settings → Developer settings → OAuth Apps → New OAuth App**.
  2. Set the homepage to the site URL, and the **Authorization callback URL** to the callback shown on Supabase's GitHub provider page (`https://<project>.supabase.co/auth/v1/callback`).
  3. Paste the Client ID and a new Client Secret into Supabase, and enable the provider.
- **Google:**
  1. In Google Cloud Console, go to **APIs & Services → Credentials → Create credentials → OAuth client ID**, application type **Web**.
  2. Add the same Supabase callback URL as an authorised redirect URI.
  3. Paste the Client ID and Secret into Supabase's Google provider, and enable it. The OAuth consent screen needs an app name and your email.

## What is stored, and who can see it

| Table | Holds | Visible to |
| --- | --- | --- |
| `profiles` | display name, picture, admin flag | everyone (names appear with comments) |
| `comments` | page, text, reply-to, dates | everyone, except comments an admin has hidden |
| `reflections` | each reader's answers to the opening questions | only that reader |

Readers can edit or delete their comments, and delete their whole account from the site's **Your account** page; deleting an account deletes everything above. Email addresses are held by Supabase Auth and are never shown on the site.

## Moderation

When signed in as an admin, every comment shows **Hide** or **Unhide**. A hidden comment disappears for everyone except its author and admins. Admins cannot edit anyone's words; they can only hide them.

## Backups

`supabase/backup.sh` copies the site's tables and the accounts to your computer as plain SQL files, in a new dated folder each time. It needs the Postgres client tools (`pg_dump`; on Fedora `sudo dnf install postgresql`, on Debian or Ubuntu `sudo apt install postgresql-client`) and the database connection string. The comments at the top of the script say where to find it. Keep the backup folder private: it contains email addresses.

## Moving to your own computer later

Supabase is open source, and the website talks to a self-hosted copy exactly as it talks to the hosted one. Moving changes two settings, not the code.

1. **Run Supabase on your computer.** Install Docker, then follow Supabase's self-hosting guide: clone `github.com/supabase/supabase`, `cd docker`, copy `.env.example` to `.env`, set new secrets as the guide explains, and run `docker compose up -d`. The dashboard opens at `http://localhost:8000`.
2. **Recreate the tables:** run `schema.sql` in the new dashboard's SQL Editor.
3. **Copy the data** from the last backup, accounts first, then the rest:
   ```sh
   psql "$LOCAL_DB_URL" -f supabase-backups/<date>/auth-users.sql
   psql "$LOCAL_DB_URL" -f supabase-backups/<date>/public.sql
   ```
4. **Make it reachable from the internet over HTTPS**, if readers outside your home should use it. A free Cloudflare Tunnel (`cloudflared`) gives a public address without opening ports on your router.
5. **Point the site at it:** set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` to the new address and the new anon key, in `.env` and in the GitHub repository variables, then rebuild.
6. **Update sign-in:** set the same Site URL and Redirect URLs as before, and change the callback URL in the Google and GitHub OAuth apps to the new address's `/auth/v1/callback`.
7. **Check it,** then pause the hosted project. Readers sign in once more; their accounts, comments and reflections are all there.

What self-hosting asks of you: the computer must stay on, because sign-in and comments stop when it is off (the reading pages, on GitHub Pages, carry on); backups become yours to run; and you install Supabase updates yourself.
