# App Shell Auth Nav Correction v1.2

Overwrite these files in your StrikeCheck / options-saas repo.

## What this package fixes

- Removes the old root-level `options-saas` header globally.
- Keeps exactly one authenticated app nav: the StrikeCheck top nav.
- Replaces the custom `OR` dropdown in `AppTopbar` with Clerk's standard `UserButton`.
- Keeps app workflow links in the top nav: Dashboard, Analyzer, History, Watchlist.
- Keeps user/account controls in Clerk's avatar menu.
- Adds app-specific Account and Billing links inside Clerk's user menu.
- Leaves analyzer scoring, ranking, result contracts, history, watchlist, and billing logic untouched.

## Correct final nav behavior

The app should show one top bar only:

```text
StrikeCheck    Dashboard    Analyzer    History    Watchlist                         [Clerk UserButton]
```

Clicking the Clerk avatar should expose Clerk-managed account controls plus the app links:

- Account
- Billing
- Manage account / profile controls
- Sign out

## Files included

See `MANIFEST.txt`.

## After overwrite

Run:

```bash
npm run build
```

Then test:

1. Open `/analyzer` and confirm the old `options-saas` header is gone.
2. Confirm only one StrikeCheck top nav appears.
3. Confirm the far-right avatar is Clerk's `UserButton`, not the custom `OR` dropdown.
4. Click the avatar and confirm Account/Billing are reachable.
5. Confirm Dashboard / Analyzer / History / Watchlist links still work.
6. Confirm analyzer results still render normally.
