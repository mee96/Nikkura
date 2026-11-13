# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

### Added
- Backend auth: `get_current_user` dependency that checks the Firebase ID token in `Authorization: Bearer` with `firebase-admin` and gives the routers a `CurrentUser` (`uid`, `email`). A missing or invalid token is a 401 without saying why, keys that cannot be fetched are a 503. Only `FIREBASE_PROJECT_ID` is needed: tokens are checked against Google's public keys, and a service account (`FIREBASE_CREDENTIALS_JSON`) is optional and never committed.
- Login screen (`/login`): email and password, Google, "I forgot my password" (new `AuthService.resetPassword`), error messages in Catalan, Spanish and English, return to the page the guard sent the person away from (only paths inside Nikkura), and no age or role asked. Login and sign-up share a new frame with its own look (`data-role="auth"`): a slow pastel mesh that blends the three roles, a silent looping background video with a dark layer for the text (`AUTH_VIDEO_URL`), and an entrance that runs once. With `prefers-reduced-motion` the mesh stays still and there is no video.
- Sign-up screen (`/signup`) with the same look as the login: username (saved as the display name in Firebase), email, password or Google, and the role (Moe Magical, Haku Sama or Senpai) applied to the visit; it asks for no age. The login and sign-up styles are shared in `auth-form.scss`. The login header now has the notebook mark and a globe button with the language list, without the "back to exploring" link or the data credit.
- Versioned SQL migrations: numbered files in `backend/migrations/` (`001_initial.sql` is the schema already on Aiven) and `python -m app.migrate`, which applies the missing ones in order, records them in `schema_migrations` and stops at the first one that fails (`--dry-run` only lists them).
- User profile API: `GET`, `POST` and `PATCH /users/me` for the logged-in user. `POST` creates the profile after signing up (username and role, the email comes from the token) and returns the same profile if it is called again; `PATCH` changes the username or the role. Roles are `moe_magical`, `haku_sama` and `senpai`; no age is asked or stored.
- Sign-up now saves the profile in the backend: once the account exists in Firebase (or with Google) the screen calls `POST /users/me` with the username and the chosen role, and applies the role the backend answers. With Google the username is the one typed, or else the name of the account, or the part of the email before the @. If saving fails the person stays logged in and sees a "Try again" button that repeats only the profile call. New `ProfileService`, the role names are mapped between the app (`moe`, `haku`, `senpai`) and the backend (`moe_magical`, `haku_sama`, `senpai`), and `AuthService.currentUser()`.
- The theme now follows the session: with someone logged in the app reads `GET /users/me` and applies the role of the profile, also after reloading the page, and it goes back to the visitor theme on log out. While the profile does not exist yet (right after creating the account) the theme is left alone. New `SessionThemeService` and `ProfileService.get()`.

## [0.2.0] - 2026-11-08

### Added
- i18n with Transloco for Catalan, Spanish and English: language from the saved choice or the browser with English as fallback, `<html lang>` kept in sync, a language switch, genre names translated, and a test that fails when a key is missing in any language.
- App layout: sidebar on desktop, icon rail on tablet, header and bottom navigation on mobile, search bar, side column, skip link, translated tab titles, a settings page with the language and a separate frame for login and sign-up. Screens that are not built yet show a coming-soon page.
- `GenreService`: looks up Jikan genre, theme and demographic ids by name (case and spaces ignored), logs unknown names and keeps working if the list can't be loaded.
- Content rules: `AnimeService` excludes Hentai (id looked up by name) on every Jikan search, filters every result again (Hentai genre or Rx rating) and refuses blocked anime by id. Hentai is the only thing never shown; ecchi and erotica are shown with a +18 mark (`isMatureAnime`). Jikan's `sfw` filter is not used.
- Explore: search while typing, filters by type, genre, theme, demographic and minimum score, sort, pagination, and loading, empty and error states. Everything lives in the URL; filters are a side panel on desktop and a bottom sheet below it. Anime cards with score and the +18 mark.
- Anime page (`/anime/:id`) from Jikan's `/full` record: cover, title, MyAnimeList score and votes, type, episodes, status, season, studios, genres and themes (each links to Explore), synopsis and trailer link. Loading, error, not-found and "not available" states (hentai), the +18 mark with its explanation for ecchi and erotica, and reserved space for save to Kura, score and comments.
- Home: a featured anime and a shelf of recommendations (the best rated of the genres of each role, or the current season for visitors) with loading, empty and error states, in Catalan, Spanish and English. Each role has its own banner motif (moon, CRT television, network of nodes) and reacts differently to hover, focus and saving, with no looping animation and reduced motion respected (`docs/DESIGN.md`, Motion and role touches).
- Firebase Auth in the frontend: `AuthService` (log in, sign up, Google, log out, current user and "ready" as signals), `authGuard` for private routes (sends visitors to `/login` with `returnUrl`) and an interceptor that adds `Authorization: Bearer <ID token>` only to calls to the Nikkura backend, never to Jikan. The Firebase web config goes in the environment files. Registering asks for no age and has no age restriction.

### Changed
- The theme preview moves to `/design` and the home is now inside the app layout.
- No sexual content for anyone, and no age option: the 18+ option and the adult rules are removed from the backend config, the READMEs and `docs/DESIGN.md`; ecchi is shown with a +18 mark.
- `--color-border-strong` is darker in Moe Magical, Haku Sama and Senpai so borders of controls reach 3:1 contrast, and `variables.css` gains the ink and accent tokens and the role flourish tokens (section 5c).
- The anime card draws a VHS spine, a corner motif and a score bar when the role asks for them through tokens; the bookmark and arrow icons join the icon set.

## [0.1.0] - 2026-10-22

### Added
- Project scaffold from `mee96/project-template`.
- Design direction for the four roles (Moe Magical, Haku Sama, Senpai and visitor): home and anime page mockups for desktop and mobile in `docs/DESIGN.md`.
- Mockups for search and filters, Kura, login and sign-up with role picker, plus the navigation pattern and breakpoints in `docs/DESIGN.md`.
- Language switch (Catalan, Spanish and English) in the mockups and i18n rules in `docs/DESIGN.md`.
- Angular 21 frontend in `frontend/`: standalone app without SSR, SCSS, Vitest and ESLint, with `core/`, `shared/` and `features/` folders and typed environment files for local and production.
- FastAPI backend in `backend/`: `GET /health` with a database check, MySQL connection to Aiven over SSL, CORS from `CORS_ORIGINS`, role genres and content rules in the config, pytest and Ruff.
- Design tokens for the four themes in `frontend/src/styles/variables.css`, switched with `data-role` on `<body>` by the `ThemeService`, self-hosted fonts, and a temporary theme preview page.
- READMEs in English, Spanish and Catalan: meaning of the name, concept, features with their milestone, stack, structure, endpoints, how to run it locally and environment variables.

### Changed
- CI runs the frontend tests with Vitest instead of Karma.
- CI installs the backend dev requirements and runs Ruff before the tests.
- `npm run lint` also runs Stylelint, which rejects raw colours in components.

### Fixed
- Search placeholder contrast in the home mockups.

[Unreleased]: https://github.com/mee96/Nikkura/compare/v0.2.0...develop
[0.2.0]: https://github.com/mee96/Nikkura/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mee96/Nikkura/releases/tag/v0.1.0
