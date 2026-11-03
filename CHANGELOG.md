# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

### Added
- Project scaffold from `mee96/project-template`.
- Design direction for the four roles (Moe Magical, Haku Sama, Senpai and visitor): home and anime page mockups for desktop and mobile in `docs/DESIGN.md`.
- Mockups for search and filters, Kura, login and sign-up with role picker, plus the navigation pattern and breakpoints in `docs/DESIGN.md`.
- Language switch (Catalan, Spanish and English) in the mockups and i18n rules in `docs/DESIGN.md`.
- Angular 21 frontend in `frontend/`: standalone app without SSR, SCSS, Vitest and ESLint, with `core/`, `shared/` and `features/` folders and typed environment files for local and production.
- FastAPI backend in `backend/`: `GET /health` with a database check, MySQL connection to Aiven over SSL, CORS from `CORS_ORIGINS`, role genres and content rules in the config, pytest and Ruff.
- Design tokens for the four themes in `frontend/src/styles/variables.css`, switched with `data-role` on `<body>` by the `ThemeService`, self-hosted fonts, and a temporary theme preview page.
- i18n with Transloco for Catalan, Spanish and English: language from the saved choice or the browser with English as fallback, `<html lang>` kept in sync, a language switch, genre names translated, and a test that fails when a key is missing in any language.
- App layout: sidebar on desktop, icon rail on tablet, header and bottom navigation on mobile, search bar, side column, skip link, translated tab titles, a settings page with the language and a separate frame for login and sign-up. Screens that are not built yet show a coming-soon page.
- `GenreService`: looks up Jikan genre, theme and demographic ids by name (case and spaces ignored), logs unknown names and keeps working if the list can't be loaded.
- Content rules: `AnimeService` excludes Hentai (id looked up by name) on every Jikan search, filters every result again (Hentai genre or Rx rating) and refuses blocked anime by id. Hentai is the only thing never shown; ecchi and erotica are shown with a +18 mark (`isMatureAnime`). Jikan's `sfw` filter is not used.
- Explore: search while typing, filters by type, genre, theme, demographic and minimum score, sort, pagination, and loading, empty and error states. Everything lives in the URL; filters are a side panel on desktop and a bottom sheet below it. Anime cards with score and the +18 mark.
- Anime page (`/anime/:id`) from Jikan's `/full` record: cover, title, MyAnimeList score and votes, type, episodes, status, season, studios, genres and themes (each links to Explore), synopsis and trailer link. Loading, error, not-found and "not available" states (Rx anime), the +18 mark with its explanation for ecchi, and reserved space for save to Kura, score and comments.
- Home: a featured anime and a shelf of recommendations (the best rated of the genres of each role, or the current season for visitors) with loading, empty and error states, in Catalan, Spanish and English. Each role has its own banner motif (moon, CRT television, network of nodes) and reacts differently to hover, focus and saving, with no looping animation and reduced motion respected (`docs/DESIGN.md`, Motion and role touches).
- READMEs in English, Spanish and Catalan: meaning of the name, concept, features with their milestone, stack, structure, endpoints, how to run it locally and environment variables.

### Changed
- The theme preview moves to `/design` and the home is now inside the app layout.
- No sexual content for anyone, and no age option: the 18+ option and the adult rules are removed from the backend config, the READMEs and `docs/DESIGN.md`; ecchi is shown with a +18 mark.
- CI runs the frontend tests with Vitest instead of Karma.
- CI installs the backend dev requirements and runs Ruff before the tests.
- `npm run lint` also runs Stylelint, which rejects raw colours in components.
- `--color-border-strong` is darker in Moe Magical, Haku Sama and Senpai so borders of controls reach 3:1 contrast, and `variables.css` gains the ink and accent tokens and the role flourish tokens (section 5c).
- The anime card draws a VHS spine, a corner motif and a score bar when the role asks for them through tokens; the bookmark and arrow icons join the icon set.

### Fixed
- Search placeholder contrast in the home mockups.
