-- Run this AFTER creating an auth user in Supabase Dashboard
-- (Authentication > Users > Add user > your email + password)
--
-- Replace the email with the one you used to create the auth user.
-- admin_users.user_id (migration 17) must equal the auth.users id for the admin
-- login lookup (lib/auth.ts requireAdmin → .eq('user_id', uid)) to resolve.

INSERT INTO admin_users (id, user_id, email, full_name)
SELECT id, id, email, 'Owner'
FROM auth.users
WHERE email = 'waxeee57@gmail.com'
ON CONFLICT (id) DO UPDATE
  SET user_id = EXCLUDED.user_id,
      email   = EXCLUDED.email;
