# Account Sign-Out Runtime Fix v1

Overwrite these files:

- `app/(app)/account/page.tsx`
- `components/account/SignOutAction.tsx`

This replaces Clerk `SignOutButton` usage on the server-rendered account page with a small client-side sign-out button using `useClerk().signOut()`.

Validate:

```bash
npm run build
npm run dev
```

Then open `/account`.
