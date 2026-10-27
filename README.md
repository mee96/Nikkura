<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=a8c4f0&height=180&section=header&text=✦%20Nikkura%20✦&fontColor=2d1b6e&fontSize=34&desc=your%20anime%20diary%20and%20storehouse&descSize=16&descColor=2d1b6e&descAlignY=65&fontAlignY=42" width="100%" alt="Nikkura" />

<br/>

<a href="README.md"><img src="https://img.shields.io/badge/English-1b2e4b?style=flat-square" alt="English"></a>
<a href="README.es.md"><img src="https://img.shields.io/badge/Espa%C3%B1ol-a8c4f0?style=flat-square&logoColor=1b2e4b" alt="Español"></a>
<a href="README.ca.md"><img src="https://img.shields.io/badge/Catal%C3%A0-f4b8d4?style=flat-square&logoColor=2d1b6e" alt="Català"></a>

<br/><br/>

![Python](https://img.shields.io/badge/Python-FastAPI-c5b9f0?style=for-the-badge&logo=python&logoColor=2d1b6e)
![Angular](https://img.shields.io/badge/Angular-21-a8c4f0?style=for-the-badge&logo=angular&logoColor=2d1b6e)
![MySQL](https://img.shields.io/badge/MySQL-Aiven-b8e8d4?style=for-the-badge&logo=mysql&logoColor=2d1b6e)
![Firebase](https://img.shields.io/badge/Firebase-Auth-f0e4a0?style=for-the-badge&logo=firebase&logoColor=2d1b6e)

<br/>

[![Issues](https://img.shields.io/badge/🐛_Issues-a8c4f0?style=flat-square&logoColor=2d1b6e)](../../issues)
&nbsp;
[![Project board](https://img.shields.io/badge/📋_Project_board-c5b9f0?style=flat-square&logoColor=2d1b6e)](../../projects)
&nbsp;
[![Design](https://img.shields.io/badge/🎨_Design-f4b8d4?style=flat-square&logoColor=2d1b6e)](docs/DESIGN.md)

</div>

<br/>

> **日記蔵 · Nikkura** joins *Nikki* (日記, diary) and *Kura* (蔵, storehouse): a personal place to keep and organise the stories you watch.

> [!NOTE]
> 🚧 **In development.** The design and the foundations (milestone M0) are done: the Angular and FastAPI apps, the CI and the design tokens of the four themes. Features arrive milestone by milestone on the [project board](../../projects).

<br/>

---

## <img src="https://api.iconify.design/ph/question-fill.svg?color=%23FF6FA8&height=24" height="22"> &nbsp;What is this?

**Nikkura** is an anime discovery app where **your role shapes the whole experience**. When you sign up you pick a role (Moe Magical, Haku Sama or Senpai) and it decides the colours of the interface, the world of each anime page and the recommendations you get. Visitors can browse, search and read everything without an account.

Built as a **monorepo**: an **Angular 21** frontend that reads anime data straight from the public **Jikan API** (MyAnimeList), and a **FastAPI** backend that only stores user data (profiles, your Kura, ratings, comments and chat) in **MySQL on Aiven**, with **Firebase** authentication.

<br/>

---

## <img src="https://api.iconify.design/ph/sparkle-fill.svg?color=%235B9BD5&height=24" height="22"> &nbsp;Key Features

* <img src="https://api.iconify.design/ph/palette-fill.svg?color=%23FF6FA8&height=18" height="16"> **Four themes:** Moe Magical, Haku Sama, Senpai and the visitor view, each with its own palette, fonts and anime page. *(design tokens ready)*
* <img src="https://api.iconify.design/ph/magnifying-glass-fill.svg?color=%235B9BD5&height=18" height="16"> **Search and filters:** by title, type, genre, theme, demographic and score. *(planned · M1)*
* <img src="https://api.iconify.design/ph/archive-fill.svg?color=%23B372CF&height=18" height="16"> **Your Kura:** folders to save anime, with your own score and a private note for each one. *(planned · M3)*
* <img src="https://api.iconify.design/ph/chats-circle-fill.svg?color=%232FB5AE&height=18" height="16"> **Community:** public average score and comments on every anime. *(planned · M4)*
* <img src="https://api.iconify.design/ph/users-three-fill.svg?color=%23E0A63B&height=18" height="16"> **Follow and share:** follow people and their folders, and recommend anime to friends. *(planned · M5)*
* <img src="https://api.iconify.design/ph/lightning-fill.svg?color=%23FF6FA8&height=18" height="16"> **Live chat:** a WebSocket room on each anime and private chat between friends. *(planned · M6)*
* <img src="https://api.iconify.design/ph/shield-check-fill.svg?color=%235B9BD5&height=18" height="16"> **Safe content:** no sexual content for anyone: hentai and erotica are never shown, and ecchi carries a +18 mark.
* <img src="https://api.iconify.design/ph/translate-fill.svg?color=%232FB5AE&height=18" height="16"> **Multilingual:** Catalan, Spanish and English. *(planned · M1)*

<br/>

---

## <img src="https://api.iconify.design/ph/image-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Screenshots

*Design mockups. Every screen, on desktop and mobile, is in [`docs/DESIGN.md`](docs/DESIGN.md).*

<div align="center">
  <img src="docs/screenshots/design/home-desktop-moe-magical.png" width="45%" alt="Home, Moe Magical" />
  &nbsp;
  <img src="docs/screenshots/design/detail-desktop-senpai.png" width="45%" alt="Anime page, Senpai" />
  <br/><br/>
  <img src="docs/screenshots/design/detail-desktop-haku-sama.png" width="45%" alt="Anime page, Haku Sama" />
  &nbsp;
  <img src="docs/screenshots/design/signup-desktop-visitor.png" width="45%" alt="Sign-up with role picker" />
</div>

<br/>

---

## <img src="https://api.iconify.design/ph/stack-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Technology Stack

| Layer | Technology |
| :--- | :--- |
| <img src="https://api.iconify.design/ph/desktop-tower-fill.svg?color=%23FF6FA8&height=18" height="16"> **Frontend** | Angular 21 · standalone components · signals · SCSS with design tokens · Vitest · ESLint · Stylelint |
| <img src="https://api.iconify.design/ph/cpu-fill.svg?color=%23B372CF&height=18" height="16"> **Backend** | FastAPI · Python 3.12 · SQLAlchemy · pytest · Ruff |
| <img src="https://api.iconify.design/ph/database-fill.svg?color=%235B9BD5&height=18" height="16"> **Database** | MySQL on Aiven (SSL) |
| <img src="https://api.iconify.design/ph/key-fill.svg?color=%232FB5AE&height=18" height="16"> **Auth** | Firebase Authentication |
| <img src="https://api.iconify.design/ph/film-strip-fill.svg?color=%23FF6FA8&height=18" height="16"> **Anime data** | Jikan API v4 (MyAnimeList), called from the browser |
| <img src="https://api.iconify.design/ph/rocket-launch-fill.svg?color=%23E0A63B&height=18" height="16"> **Deploy** | Render (static site + web service) · Aiven |

<br/>

---

## <img src="https://api.iconify.design/ph/folder-fill.svg?color=%232FB5AE&height=24" height="22"> &nbsp;Project Structure

<pre><code>Nikkura/
├── 🐍 backend/
│   ├── app/
│   │   ├── main.py          FastAPI app, CORS, routers
│   │   ├── core/config.py   settings, role genres, content rules
│   │   ├── routers/         endpoints (health for now)
│   │   ├── schemas/         Pydantic models
│   │   ├── models/          database tables
│   │   ├── services/        business logic
│   │   └── utils/db.py      MySQL connection
│   └── tests/
│
├── 🅰️ frontend/
│   └── src/
│       ├── styles/variables.css   all design tokens, one block per theme
│       ├── environments/          local and production settings
│       └── app/
│           ├── core/              services (ThemeService…)
│           ├── features/          one folder per screen
│           └── shared/            reusable components
│
└── 📐 docs/
    ├── DESIGN.md            roles, palettes, navigation, breakpoints, i18n
    └── screenshots/design/  mockups</code></pre>

<br/>

---

## <img src="https://api.iconify.design/ph/code-bold.svg?color=%235B9BD5&height=24" height="22"> &nbsp;Main Endpoints

The backend grows with each milestone. The full, always up-to-date reference is the interactive documentation at `/docs`.

### <img src="https://api.iconify.design/ph/heartbeat-fill.svg?color=%23E0A63B&height=20" height="18"> Health
<pre><code>GET    /health        → Service status and database check (200 ok · 503 degraded)</code></pre>

<br/>

---

## <img src="https://api.iconify.design/ph/play-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Run Locally

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env             # Fill in the Aiven credentials
uvicorn app.main:app --reload
```

> `http://localhost:8000/health` should answer `{"status": "ok", "database": "up"}`, and `http://localhost:8000/docs` shows the API.

> [!TIP]
> On Windows, if Smart App Control or a company policy blocks SQLAlchemy (`DLL load failed`), run it in pure Python:
> PowerShell `$env:DISABLE_SQLALCHEMY_CEXT_RUNTIME = "1"` · cmd `setx DISABLE_SQLALCHEMY_CEXT_RUNTIME 1`.

### Frontend

```bash
cd frontend
npm install
npm start
```

> Open `http://localhost:4200` ✨

### Tests and lint

```bash
cd backend  && pytest -q && ruff check . && ruff format --check .
cd frontend && npm test -- --watch=false && npm run lint
```

<br/>

---

## <img src="https://api.iconify.design/ph/sliders-horizontal-fill.svg?color=%23FF6FA8&height=24" height="22"> &nbsp;Environment Variables

Create a `.env` file in `backend/` (see `backend/.env.example`):

```env
ENVIRONMENT=local            # local or production
DB_HOST=...
DB_PORT=...
DB_NAME=nikkura
DB_USER=...
DB_PASSWORD=...
DB_SSL_CA=./ca.pem           # CA certificate from the Aiven console (never committed)
CORS_ORIGINS=http://localhost:4200
```

The frontend settings (backend URL, Jikan URL, Firebase web config) are in `frontend/src/environments/`.

<br/>

---

## <img src="https://api.iconify.design/ph/git-branch-fill.svg?color=%232FB5AE&height=24" height="22"> &nbsp;Workflow

* <img src="https://api.iconify.design/ph/git-branch-bold.svg?color=%232FB5AE&height=16" height="14"> **Gitflow:** `main` (production) · `develop` (integration) · `feature/*`, `fix/*`, `chore/*`, `docs/*` branches merged through pull requests.
* <img src="https://api.iconify.design/ph/git-commit-bold.svg?color=%232FB5AE&height=16" height="14"> **Conventional Commits:** `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`…
* <img src="https://api.iconify.design/ph/kanban-bold.svg?color=%232FB5AE&height=16" height="14"> **Planning:** issues with labels and one milestone per phase (M0 design and foundations → M7 polish), tracked on the [project board](../../projects).
* <img src="https://api.iconify.design/ph/check-circle-bold.svg?color=%232FB5AE&height=16" height="14"> **CI:** GitHub Actions lints, builds and tests the frontend and the backend on every pull request.
* <img src="https://api.iconify.design/ph/paint-brush-bold.svg?color=%232FB5AE&height=16" height="14"> **Design first:** every screen was designed for the four themes before coding, see [`docs/DESIGN.md`](docs/DESIGN.md).

<br/>

---

<div align="center">

*Built to keep the anime I love in one place, and because every way of watching anime deserves its own world.* 🌸

<br/><br/>

Developed by **Carme Medina Canalda**<br/>
*Full Stack Developer · Barcelona*

<br/>

[![Portfolio](https://img.shields.io/badge/Portfolio-c5b9f0?style=flat-square&logoColor=2d1b6e)](https://carme-portfoli.onrender.com/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-a8c4f0?style=flat-square&logo=linkedin&logoColor=2d1b6e)](https://www.linkedin.com/in/carme-medina-canalda-250457132/)
[![GitHub](https://img.shields.io/badge/GitHub-f4b8d4?style=flat-square&logo=github&logoColor=2d1b6e)](https://github.com/mee96)

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=a8c4f0&height=110&section=footer" width="100%" alt="footer" />

</div>
