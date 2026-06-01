-- Run this AFTER creating/confirming the auth user in Supabase Dashboard
-- (Authentication > Users) and AFTER migration 17 (adds admin_users.user_id + email).
--
-- This ONLY copies an already-existing auth.users row into admin_users — it never
-- creates the GoTrue identity and never sets a password (the owner does that).
-- admin_users.user_id must equal the auth.users id so the admin login lookup
-- (lib/auth.ts requireAdmin → .eq('user_id', uid)) resolves.
--
-- Canonical admin account = waxee@icloud.com (auth uid fac5e812-...): it is the
-- account whose password the owner knows and which logs in 200. Do NOT seed
-- waxeee57@gmail.com — that lookalike address was the source of the login mix-up.

INSERT INTO admin_users (id, user_id, email, full_name)
SELECT id, id, email, 'Owner'
FROM auth.users
WHERE email = 'waxee@icloud.com'
ON CONFLICT (id) DO UPDATE
  SET user_id = EXCLUDED.user_id,
      email   = EXCLUDED.email;
