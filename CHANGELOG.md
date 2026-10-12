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

### Changed
- CI runs the frontend tests with Vitest instead of Karma.

### Fixed
- Search placeholder contrast in the home mockups.
