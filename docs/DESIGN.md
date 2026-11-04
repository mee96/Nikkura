# Design direction

Nikkura has one layout and four looks. When a user signs up they pick a **role**, and the role decides the colours, the typography and the personality of the anime page. Visitors without an account get a fourth look of their own.

Two rules shape every screen:

- **Home: polished app.** Same structure for everyone (sidebar, search, featured anime, recommendations, trends). Only the theme tokens change.
- **Anime page: a world per role.** The detail page is where each role shows its personality, so the layout changes too. The content is always the same: cover, scores, synopsis, private note, community ratings, public comments and live chat.

## Roles

| Role | Recommendations (Jikan genres) | Palette | Anime page concept | Typefaces |
| :--- | :--- | :--- | :--- | :--- |
| 🌸 **Moe Magical** | Shoujo · Mahou Shoujo · Romance | `#FFF2F7` `#C83E7A` `#E9DDFB` `#4A2541` | Y2K desktop: every section is a retro window (`SINOPSI.TXT`, `COMUNITAT.EXE`, `XAT_EN_DIRECTE.EXE`) | Mochiy Pop One · DotGothic16 · M PLUS Rounded 1c |
| 📼 **Haku Sama** | Shoujo · Isekai | `#16153A` `#5149C4` `#7FE3FF` `#FF9BD2` | Video rental store: the anime is a VHS box, the user holds a member card, the chat plays on a CRT TV | Monoton · Zen Dots · M PLUS Rounded 1c |
| 🔥 **Senpai** | Seinen · Slice of Life | `#120C09` `#FF7A1F` `#FFB874` `#F6EADB` | Status window (dark): stat bars, guild channel, private grimoire, rune rating | Dela Gothic One · Chakra Petch · Zen Kaku Gothic New |
| **Visitor** (no account) | Current season, all genres | `#EEF1E3` `#4E7A3E` `#E7C78E` `#2C3824` | Slice-of-life notebook: polaroid cover, hanko stamps for scores, sticky notes. Read-only, with invitations to sign up | Kiwi Maru · Klee One · Zen Kaku Gothic New |

The palette is applied with CSS custom properties switched by a `data-role` attribute on `<body>` (`moe`, `haku`, `senpai`, `guest`). Components only use tokens, never raw colours.

All tokens (colours, fonts, type scale, spacing, radius, shadows and motion) live in one file: [`frontend/src/styles/variables.css`](../frontend/src/styles/variables.css). The `ThemeService` sets `data-role`, and Stylelint fails the build if a component writes a raw colour. Fonts are self-hosted with Fontsource (Latin subset), so no request goes to Google Fonts.

## Content rules shown in the UI

- **Hentai is never shown, to anyone.** Every Jikan search excludes the Hentai genre (found by name), and every result is filtered again in the app: anything tagged Hentai or rated Rx is hidden. An anime page for one of them is not shown. Nikkura does not use Jikan's `sfw` filter.
- **Ecchi and erotica are shown with a +18 mark.** Jikan lists them as explicit, but they are not hentai. The mark is a small "+18" badge on the cover and the anime page, with a text that explains it.

- Visitors can read everything (scores, comments, chat) but every action asks them to sign in.
- Private notes are only visible to their author and are marked with a lock.
- Scores show the Nikkura community average next to the MyAnimeList score.
- The live chat keeps the last 50 messages of each anime room.

## Navigation

- **Desktop:** fixed sidebar with Inici, Explorar, Temporada, El meu Kura and Configuració, plus the user card at the bottom.
- **Mobile:** bottom navigation with four tabs (Inici, Explorar, Temporada, Kura). The profile and settings open from the avatar in the header.
- **Tablet:** the sidebar becomes an icon rail with a short label under each icon (Kura, Ajustos), the language switch stacked and the account buttons as icons.
- **Login and sign-up** have no app navigation: only the brand and a round globe button with the language list.
- **Side column:** on desktop each page can fill a column on the right (on the home: the role invitation for visitors, then the Kura folders and trends). Below 1200 px it is hidden and its content moves into the page.
- **Skip link:** the first Tab shows "Skip to content", which moves focus to the main content.

## Languages (i18n)

Nikkura is fully trilingual: **Catalan, Spanish and English**. Every piece of UI text is a translation key, never a hard-coded string, from the first component.

- The first visit uses the browser language (Catalan, Spanish or English, with English as fallback). Once chosen, the language is saved in the user's profile; visitors keep it in the browser.
- **Desktop:** CA · ES · EN switch at the bottom of the sidebar. **Login and sign-up:** switch in the header. **Mobile:** language button in the login and sign-up header, and in Configuració inside the app.
- The `<html lang>` attribute changes with the language, and each option is labelled in its own language (Català, Castellano, English).
- "Kura" is a name and is never translated. Genre names come from Jikan in English and are translated with our own table.
- Catalan and Spanish texts are usually 20–30% longer than English, so buttons and chips grow with their content and never use fixed widths.
- The mockups are drawn in Catalan.

## Breakpoints

| Name | Width | Layout |
| :--- | :--- | :--- |
| Mobile | < 768 px | Bottom navigation, one column, 2-column cover grids, filters in a bottom sheet |
| Tablet | 768–1199 px | Sidebar collapsed to an icon rail, filters in a sheet, 3–4 column grids |
| Desktop | ≥ 1200 px | Full 248 px sidebar, filters panel next to the results, 5–6 column grids |

The mockups are drawn at 390 px (mobile) and 1440 px (desktop).

## Accessibility

- Text contrast checked against WCAG AA on every theme, including the dark one. Placeholders use the full muted colour, never a lower opacity.
- Touch targets of at least 44 px on mobile.
- Borders of controls and chips (`--color-border-strong`) reach 3:1 against the surface they sit on (WCAG 1.4.11), on every theme.
- Real `<button>`, `<a>`, `<input>` and `<label>` elements; icon-only buttons have an `aria-label`.
- Filter chips are toggle buttons (`aria-pressed`), the role picker is a radio group inside a `<fieldset>`, and folders in the Kura are tabs.

## Motion and role touches

The structure is the same for every role; the personality shows in how the interface answers. Everything lives in tokens (section 5c of `variables.css`) or in a decorative component, so a screen never checks the role:

| | Moe Magical | Haku Sama | Senpai |
| :--- | :--- | :--- | :--- |
| Banner motif | Moon and sparkles | CRT television with scanlines on its own screen | Network of nodes joined by paths |
| Cover | Round motif, lifts 6 px | VHS spine and shelf lip, comes off the shelf (14 px, 2° tilt) | Diamond motif, ring on hover or focus |
| Under the title | Nothing | Nothing | Score as ten segments that fill in |
| Entering | Rises 8 px with a small scale | Slides in from the right | Bars fill in; covers stay put |
| Saving | Four sparks, once | One ring around the button, once | One ring around the button, once |

Rules for every effect:

- It runs once and stops. Nothing loops, and backgrounds never compete with reading or filtering. The only exception is the background of login and sign-up (below): a very slow drift that never goes behind the form's text.
- Scanlines and tracking lines exist on the CRT screen only, never over text.
- `prefers-reduced-motion`: animations end at their final state straight away, and covers no longer lift, tilt or slide in. The ring or shadow of hover and focus stays, so the state is still visible without movement.
- Keyboard focus triggers the same reaction as hover.

## Screens

### Home · desktop

| Moe Magical | Haku Sama |
| :---: | :---: |
| ![Home, Moe Magical](screenshots/design/home-desktop-moe-magical.png) | ![Home, Haku Sama](screenshots/design/home-desktop-haku-sama.png) |
| **Senpai** | **Visitor** |
| ![Home, Senpai](screenshots/design/home-desktop-senpai.png) | ![Home, visitor](screenshots/design/home-desktop-visitor.png) |

### Anime page · as built

One layout for every theme, built only with tokens, so each role already gets its own colours, radii and fonts (`--font-world-title`, `--font-world-text`). Cover with the +18 mark, title, genre chips that open Explore filtered by them, score and facts, trailer link (it opens YouTube in a new tab, nothing is embedded), synopsis, and three reserved cards for save to Kura, score and comments. The role-specific worlds of the mockups (Y2K windows, VHS box, status window, notebook) arrive with the roles in M2 and the community in M4.

### Anime page · desktop

| Moe Magical | Haku Sama |
| :---: | :---: |
| ![Anime page, Moe Magical](screenshots/design/detail-desktop-moe-magical.png) | ![Anime page, Haku Sama](screenshots/design/detail-desktop-haku-sama.png) |
| **Senpai** | **Visitor** |
| ![Anime page, Senpai](screenshots/design/detail-desktop-senpai.png) | ![Anime page, visitor](screenshots/design/detail-desktop-visitor.png) |

### Mobile

| | Moe Magical | Haku Sama | Senpai | Visitor |
| :--- | :---: | :---: | :---: | :---: |
| Home | ![](screenshots/design/home-mobile-moe-magical.png) | ![](screenshots/design/home-mobile-haku-sama.png) | ![](screenshots/design/home-mobile-senpai.png) | ![](screenshots/design/home-mobile-visitor.png) |
| Anime page | ![](screenshots/design/detail-mobile-moe-magical.png) | ![](screenshots/design/detail-mobile-haku-sama.png) | ![](screenshots/design/detail-mobile-senpai.png) | ![](screenshots/design/detail-mobile-visitor.png) |

### Search and filters

Text search plus filters by type, genre, theme, demographic and minimum score. Active filters show as removable chips above the results, and a note reminds that explicit content is never shown. On mobile and tablet the filters open in a bottom sheet.

As built: the search box in the top bar searches while typing on Explore; every filter lives in the URL (`/explore?q=luna&type=tv&genres=romance,shoujo&min_score=7&sort=score&page=2`), so a search can be shared and the back button works. Genres are written by name, never by id. The minimum score uses chips (Any, 6+, 7+, 8+) on every size instead of the desktop slider, and ecchi shows its +18 mark on the chip and on the cover. Shown in Moe Magical and Haku Sama, as these screens only change theme tokens.

| Desktop · Moe Magical | Desktop · Haku Sama |
| :---: | :---: |
| ![Search, Moe Magical](screenshots/design/search-desktop-moe-magical.png) | ![Search, Haku Sama](screenshots/design/search-desktop-haku-sama.png) |

| Mobile · Moe Magical | Mobile · Haku Sama | Filter sheet |
| :---: | :---: | :---: |
| ![](screenshots/design/search-mobile-moe-magical.png) | ![](screenshots/design/search-mobile-haku-sama.png) | ![](screenshots/design/search-filters-mobile-moe-magical.png) |

### Kura

The personal library. Folders sit on top as tabs; each one shows how many anime it holds and who can see it (only me, followers or everyone). The two default folders, Preferits and Per veure, are marked and cannot be deleted. Every saved anime shows the user's own score and a lock when it has a private note.

| Desktop · Moe Magical | Desktop · Haku Sama |
| :---: | :---: |
| ![Kura, Moe Magical](screenshots/design/kura-desktop-moe-magical.png) | ![Kura, Haku Sama](screenshots/design/kura-desktop-haku-sama.png) |

| Mobile · Moe Magical | Mobile · Haku Sama |
| :---: | :---: |
| ![](screenshots/design/kura-mobile-moe-magical.png) | ![](screenshots/design/kura-mobile-haku-sama.png) |

### Login and sign-up

Both have their own look (`data-role="auth"`), because the person has no role yet: a **pastel mesh** that blends the soft colours of the three roles (pink and lilac from Moe Magical, blues from Haku Sama, peach from Senpai, plus mint). The mesh drifts very slowly (38–52 s per trip, `transform` only) and stays still with `prefers-reduced-motion`. Over it plays a silent, looping video (`AUTH_VIDEO_URL`): while it plays, a dark layer keeps the light text readable; if it cannot load, or with reduced motion, the mesh stays and the text is dark. The layout is a big welcome at the bottom left and the form at the right, with no card (stacked on mobile): white pill fields and a pink (dark over the mesh) main button; the header has the brand with the notebook-and-bookmark mark and a white round globe button that opens the language list. The login asks for email and password, or Google, and has "I forgot my password", "Create one" and "Continue without an account". Sign-up has the same look: the welcome on the left and, on the right, username, email and password (or Google) and three solid role tiles (Moe Magical, Haku Sama, Senpai) with their colours and name, and no explanation text. On a phone the welcome goes away and the form starts at the top. For now the role is applied to the visit; saving it in the profile comes with the user data (M5). There is no age option: hentai is never shown to anyone, and ecchi and erotica carry a +18 mark. (The "18 or older" note in the sign-up mockup is out of date and goes away when the screen is built in M2. The screenshots below are the first notebook mockups; the built login follows the description above.)

| Login · desktop | Sign-up · desktop |
| :---: | :---: |
| ![Login](screenshots/design/login-desktop-visitor.png) | ![Sign-up](screenshots/design/signup-desktop-visitor.png) |

| Login · mobile | Sign-up, step 2 · mobile |
| :---: | :---: |
| ![](screenshots/design/login-mobile-visitor.png) | ![](screenshots/design/signup-mobile-visitor.png) |

> Anime titles, covers and comments in the mockups are placeholders. Real data comes from the Jikan API and from Nikkura users.
