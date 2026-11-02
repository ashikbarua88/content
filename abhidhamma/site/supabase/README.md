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
