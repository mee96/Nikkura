<!-- ✏️ TEMPLATE README — follow docs/README_GUIDE.md.
     Keep README.md, README.es.md and README.ca.md in sync: same sections, same order.
     Every "✏️" comment marks something to replace; delete the comments when done. -->

> [!TIP]
> 📐 **This is a template repository.** Start a new project with **Use this template → Create a new repository**.
> Everything it includes and how to fill it in is in [`docs/README_GUIDE.md`](docs/README_GUIDE.md). *Delete this note in your project.*

<div align="center">

<!-- ✏️ Header: change text=, desc= and color= (one pastel per project, see the guide). Spaces are %20. -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=c5b9f0&height=180&section=header&text=✦%20Project%20Name%20✦&fontColor=2d1b6e&fontSize=34&desc=one-line%20tagline%20of%20the%20project&descSize=16&descColor=2d1b6e&descAlignY=65&fontAlignY=42" width="100%" alt="Project Name" />

<br/>

<a href="README.md"><img src="https://img.shields.io/badge/English-1b2e4b?style=flat-square" alt="English"></a>
<a href="README.es.md"><img src="https://img.shields.io/badge/Espa%C3%B1ol-a8c4f0?style=flat-square&logoColor=1b2e4b" alt="Español"></a>
<a href="README.ca.md"><img src="https://img.shields.io/badge/Catal%C3%A0-f4b8d4?style=flat-square&logoColor=2d1b6e" alt="Català"></a>

<br/><br/>

<!-- ✏️ Stack badges: only what this project really uses. Pastel order: c5b9f0 · a8c4f0 · b8e8d4 · f0e4a0 · f4b8d4 -->
![Python](https://img.shields.io/badge/Python-FastAPI-c5b9f0?style=for-the-badge&logo=python&logoColor=2d1b6e)
![Angular](https://img.shields.io/badge/Angular-21-a8c4f0?style=for-the-badge&logo=angular&logoColor=2d1b6e)
![MySQL](https://img.shields.io/badge/MySQL-Aiven-b8e8d4?style=for-the-badge&logo=mysql&logoColor=2d1b6e)
![Firebase](https://img.shields.io/badge/Firebase-Auth-f0e4a0?style=for-the-badge&logo=firebase&logoColor=2d1b6e)

<br/>

<!-- ✏️ Links: replace the URLs. Remove Demo/API Docs until they exist. Keep the Render note only if it is hosted on the free tier. -->
[![Demo](https://img.shields.io/badge/🌐_Live_Demo-f4b8d4?style=flat-square&logoColor=2d1b6e)](https://example.onrender.com)
&nbsp;
[![API Docs](https://img.shields.io/badge/📖_API_Docs-b8e8d4?style=flat-square&logoColor=2d1b6e)](https://example-api.onrender.com/docs)
&nbsp;
[![Issues](https://img.shields.io/badge/🐛_Issues-a8c4f0?style=flat-square&logoColor=2d1b6e)](../../issues)
&nbsp;
[![Project board](https://img.shields.io/badge/📋_Project_board-c5b9f0?style=flat-square&logoColor=2d1b6e)](../../projects)
![Render Free Tier](https://img.shields.io/badge/Render_Free_Tier-Cold_start_~1_min-f0e4a0?style=flat-square&logo=render&logoColor=2d1b6e)

</div>

<br/>

---

## <img src="https://api.iconify.design/ph/question-fill.svg?color=%23FF6FA8&height=24" height="22"> &nbsp;What is this?

<!-- ✏️ Two short paragraphs: 1) what the app does and for whom; 2) how it is built (architecture in one sentence). -->
**Project Name** is a full-stack app that helps *who* do *what*.

Built as a **monorepo** with an **Angular** frontend and a **FastAPI** backend, a **MySQL** database on Aiven and **Firebase** authentication.

<br/>

---

## <img src="https://api.iconify.design/ph/sparkle-fill.svg?color=%235B9BD5&height=24" height="22"> &nbsp;Key Features

<!-- ✏️ 4–8 features. Format: icon + **Name:** what the user can do. -->
* <img src="https://api.iconify.design/ph/sign-in-fill.svg?color=%23FF6FA8&height=18" height="16"> **Feature one:** what the user can do with it.
* <img src="https://api.iconify.design/ph/lightning-fill.svg?color=%23E0A63B&height=18" height="16"> **Feature two:** what the user can do with it.
* <img src="https://api.iconify.design/ph/translate-fill.svg?color=%232FB5AE&height=18" height="16"> **Multilingual:** Catalan, Spanish and English.

<br/>

---

## <img src="https://api.iconify.design/ph/image-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Screenshots

<!-- ✏️ Save images in docs/screenshots/ and uncomment. A GIF of the main flow works best.
<div align="center">
  <img src="docs/screenshots/home.png" width="45%" alt="Home" />
  &nbsp;
  <img src="docs/screenshots/detail.png" width="45%" alt="Detail" />
</div>
-->

*Coming soon.*

<br/>

---

## <img src="https://api.iconify.design/ph/stack-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Technology Stack

| Layer | Technology |
| :--- | :--- |
| <img src="https://api.iconify.design/ph/desktop-tower-fill.svg?color=%23FF6FA8&height=18" height="16"> **Frontend** | Angular · standalone components · signals |
| <img src="https://api.iconify.design/ph/cpu-fill.svg?color=%23B372CF&height=18" height="16"> **Backend** | FastAPI · Python · SQLAlchemy |
| <img src="https://api.iconify.design/ph/database-fill.svg?color=%235B9BD5&height=18" height="16"> **Database** | MySQL · Aiven Cloud |
| <img src="https://api.iconify.design/ph/key-fill.svg?color=%232FB5AE&height=18" height="16"> **Auth** | Firebase Authentication |
| <img src="https://api.iconify.design/ph/rocket-launch-fill.svg?color=%23E0A63B&height=18" height="16"> **Deploy** | Render (frontend + backend) |

<br/>

---

## <img src="https://api.iconify.design/ph/folder-fill.svg?color=%232FB5AE&height=24" height="22"> &nbsp;Project Structure

<pre><code>project-name/
├── 🐍 backend/
│   └── app/
│       ├── main.py
│       ├── models/
│       ├── schemas/
│       ├── routers/
│       ├── services/
│       └── core/
│
└── 🅰️ frontend/
    └── src/app/
        ├── features/
        ├── core/
        └── shared/</code></pre>

<br/>

---

## <img src="https://api.iconify.design/ph/code-bold.svg?color=%235B9BD5&height=24" height="22"> &nbsp;Main Endpoints

<!-- ✏️ Group by resource. Full reference lives in the API Docs (/docs). -->
### <img src="https://api.iconify.design/ph/package-fill.svg?color=%23E0A63B&height=20" height="18"> Items
<pre><code>GET    /items/        → List items
POST   /items/        → Create an item
PATCH  /items/{id}    → Update an item
DELETE /items/{id}    → Delete an item</code></pre>

<br/>

---

## <img src="https://api.iconify.design/ph/play-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Run Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env    # Fill in the credentials
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

> Open `http://localhost:4200` ✨

<br/>

---

## <img src="https://api.iconify.design/ph/sliders-horizontal-fill.svg?color=%23FF6FA8&height=24" height="22"> &nbsp;Environment Variables

Create a `.env` file in `backend/` (see `backend/.env.example`):

```env
DB_HOST=...
DB_PORT=...
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
```

<br/>

---

## <img src="https://api.iconify.design/ph/git-branch-fill.svg?color=%232FB5AE&height=24" height="22"> &nbsp;Workflow

* <img src="https://api.iconify.design/ph/git-branch-bold.svg?color=%232FB5AE&height=16" height="14"> **Gitflow:** `main` (production) · `develop` (integration) · `feature/*`, `fix/*`, `chore/*` branches merged through pull requests.
* <img src="https://api.iconify.design/ph/git-commit-bold.svg?color=%232FB5AE&height=16" height="14"> **Conventional Commits:** `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`…
* <img src="https://api.iconify.design/ph/kanban-bold.svg?color=%232FB5AE&height=16" height="14"> **Planning:** issues with labels and milestones, tracked on the [project board](../../projects).
* <img src="https://api.iconify.design/ph/check-circle-bold.svg?color=%232FB5AE&height=16" height="14"> **CI:** GitHub Actions builds the frontend and checks the backend on every pull request.

<br/>

---

<div align="center">

<!-- ✏️ One personal line: why you built it. -->
*Built because …* 🌸

<br/><br/>

Developed by **Carme Medina Canalda**<br/>
*Full Stack Developer · Barcelona*

<br/>

[![Portfolio](https://img.shields.io/badge/Portfolio-c5b9f0?style=flat-square&logoColor=2d1b6e)](https://carme-portfoli.onrender.com/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-a8c4f0?style=flat-square&logo=linkedin&logoColor=2d1b6e)](https://www.linkedin.com/in/carme-medina-canalda-250457132/)
[![GitHub](https://img.shields.io/badge/GitHub-f4b8d4?style=flat-square&logo=github&logoColor=2d1b6e)](https://github.com/mee96)

<br/>

<!-- ✏️ Same color= as the header. -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=c5b9f0&height=110&section=footer" width="100%" alt="footer" />

</div>
