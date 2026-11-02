#!/bin/sh
# Copies everything the site stores in Supabase to this computer, as plain SQL files.
# Run it whenever you like (or weekly from cron). Needs the Postgres client tools (pg_dump).
#
# Get the connection string from Supabase: Project Settings → Database → Connection string → URI
# (use the "Session pooler" one), with your database password filled in, and put it in an
# environment variable so it never ends up in a file:
#   export SUPABASE_DB_URL='postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres'
#   sh supabase/backup.sh
set -eu
: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL first (see the top of this file)}"
dir="${1:-supabase-backups}/$(date +%Y-%m-%d_%H%M)"
mkdir -p "$dir"
# The site's own tables: profiles, comments, reflections, with their rules.
pg_dump "$SUPABASE_DB_URL" --schema=public --no-owner --no-privileges -f "$dir/public.sql"
# The accounts: emails, encrypted passwords, sign-in identities.
pg_dump "$SUPABASE_DB_URL" --data-only --table=auth.users --table=auth.identities -f "$dir/auth-users.sql"
echo "Backed up to $dir"
