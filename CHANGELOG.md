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
- `GenreService`: looks up Jikan genre, theme and demographic ids by name (case and spaces ignored), logs unknown names and keeps working if the list can't be loaded.
- READMEs in English, Spanish and Catalan: meaning of the name, concept, features with their milestone, stack, structure, endpoints, how to run it locally and environment variables.

### Changed
- CI runs the frontend tests with Vitest instead of Karma.
- CI installs the backend dev requirements and runs Ruff before the tests.
- `npm run lint` also runs Stylelint, which rejects raw colours in components.

### Fixed
- Search placeholder contrast in the home mockups.
