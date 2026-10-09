<!-- ✏️ TEMPLATE README — see docs/README_GUIDE.md. Same sections and order as README.md. -->

> [!TIP]
> 📐 **Aquest repositori és una plantilla.** Crea un projecte nou amb **Use this template → Create a new repository**.
> Què inclou i com omplir-lo és a [`docs/README_GUIDE.md`](docs/README_GUIDE.md). *Esborra aquesta nota al teu projecte.*

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=c5b9f0&height=180&section=header&text=✦%20Project%20Name%20✦&fontColor=2d1b6e&fontSize=34&desc=frase%20curta%20del%20projecte&descSize=16&descColor=2d1b6e&descAlignY=65&fontAlignY=42" width="100%" alt="Project Name" />

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

[![Demo](https://img.shields.io/badge/🌐_Demo-f4b8d4?style=flat-square&logoColor=2d1b6e)](https://example.onrender.com)
&nbsp;
[![API Docs](https://img.shields.io/badge/📖_Docs_API-b8e8d4?style=flat-square&logoColor=2d1b6e)](https://example-api.onrender.com/docs)
&nbsp;
[![Issues](https://img.shields.io/badge/🐛_Issues-a8c4f0?style=flat-square&logoColor=2d1b6e)](../../issues)
&nbsp;
[![Project board](https://img.shields.io/badge/📋_Tauler-c5b9f0?style=flat-square&logoColor=2d1b6e)](../../projects)
![Render Free Tier](https://img.shields.io/badge/Render_Free_Tier-Arrencada_en_fred_~1_min-f0e4a0?style=flat-square&logo=render&logoColor=2d1b6e)

</div>

<br/>

---

## <img src="https://api.iconify.design/ph/question-fill.svg?color=%23FF6FA8&height=24" height="22"> &nbsp;Què és això?

**Project Name** és una app full stack que ajuda *qui* a fer *què*.

Construïda com a **monorepo** amb frontend en **Angular**, backend en **FastAPI**, base de dades **MySQL** a Aiven i autenticació amb **Firebase**.

<br/>

---

## <img src="https://api.iconify.design/ph/sparkle-fill.svg?color=%235B9BD5&height=24" height="22"> &nbsp;Característiques principals

* <img src="https://api.iconify.design/ph/sign-in-fill.svg?color=%23FF6FA8&height=18" height="16"> **Funcionalitat u:** què hi pot fer l'usuari.
* <img src="https://api.iconify.design/ph/lightning-fill.svg?color=%23E0A63B&height=18" height="16"> **Funcionalitat dos:** què hi pot fer l'usuari.
* <img src="https://api.iconify.design/ph/translate-fill.svg?color=%232FB5AE&height=18" height="16"> **Multilingüe:** català, castellà i anglès.

<br/>

---

## <img src="https://api.iconify.design/ph/image-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Captures

<!-- ✏️ Save images in docs/screenshots/ and uncomment. A GIF of the main flow works best.
<div align="center">
  <img src="docs/screenshots/home.png" width="45%" alt="Home" />
  &nbsp;
  <img src="docs/screenshots/detail.png" width="45%" alt="Detail" />
</div>
-->

*Properament.*

<br/>

---

## <img src="https://api.iconify.design/ph/stack-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Stack tecnològic

| Capa | Tecnologia |
| :--- | :--- |
| <img src="https://api.iconify.design/ph/desktop-tower-fill.svg?color=%23FF6FA8&height=18" height="16"> **Frontend** | Angular · standalone components · signals |
| <img src="https://api.iconify.design/ph/cpu-fill.svg?color=%23B372CF&height=18" height="16"> **Backend** | FastAPI · Python · SQLAlchemy |
| <img src="https://api.iconify.design/ph/database-fill.svg?color=%235B9BD5&height=18" height="16"> **Base de dades** | MySQL · Aiven Cloud |
| <img src="https://api.iconify.design/ph/key-fill.svg?color=%232FB5AE&height=18" height="16"> **Auth** | Firebase Authentication |
| <img src="https://api.iconify.design/ph/rocket-launch-fill.svg?color=%23E0A63B&height=18" height="16"> **Deploy** | Render (frontend + backend) |

<br/>

---

## <img src="https://api.iconify.design/ph/folder-fill.svg?color=%232FB5AE&height=24" height="22"> &nbsp;Estructura del projecte

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

## <img src="https://api.iconify.design/ph/code-bold.svg?color=%235B9BD5&height=24" height="22"> &nbsp;Endpoints principals

### <img src="https://api.iconify.design/ph/package-fill.svg?color=%23E0A63B&height=20" height="18"> Items
<pre><code>GET    /items/        → Llistar items
POST   /items/        → Crear un item
PATCH  /items/{id}    → Actualitzar un item
DELETE /items/{id}    → Eliminar un item</code></pre>

<br/>

---

## <img src="https://api.iconify.design/ph/play-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Com arrencar en local

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env    # Omple les credencials
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

> Obre `http://localhost:4200` ✨

<br/>

---

## <img src="https://api.iconify.design/ph/sliders-horizontal-fill.svg?color=%23FF6FA8&height=24" height="22"> &nbsp;Variables d'entorn

Crea un fitxer `.env` a `backend/` (vegeu `backend/.env.example`):

```env
DB_HOST=...
DB_PORT=...
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
```

<br/>

---

## <img src="https://api.iconify.design/ph/git-branch-fill.svg?color=%232FB5AE&height=24" height="22"> &nbsp;Flux de treball

* <img src="https://api.iconify.design/ph/git-branch-bold.svg?color=%232FB5AE&height=16" height="14"> **Gitflow:** `main` (producció) · `develop` (integració) · branques `feature/*`, `fix/*`, `chore/*` que entren mitjançant pull requests.
* <img src="https://api.iconify.design/ph/git-commit-bold.svg?color=%232FB5AE&height=16" height="14"> **Conventional Commits:** `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`…
* <img src="https://api.iconify.design/ph/kanban-bold.svg?color=%232FB5AE&height=16" height="14"> **Planificació:** issues amb labels i milestones, seguides al [tauler del projecte](../../projects).
* <img src="https://api.iconify.design/ph/check-circle-bold.svg?color=%232FB5AE&height=16" height="14"> **CI:** GitHub Actions compila el frontend i comprova el backend a cada pull request.

<br/>

---

<div align="center">

*El vaig construir perquè…* 🌸

<br/><br/>

Desenvolupat per **Carme Medina Canalda**<br/>
*Full Stack Developer · Barcelona*

<br/>

[![Portfolio](https://img.shields.io/badge/Portfolio-c5b9f0?style=flat-square&logoColor=2d1b6e)](https://carme-portfoli.onrender.com/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-a8c4f0?style=flat-square&logo=linkedin&logoColor=2d1b6e)](https://www.linkedin.com/in/carme-medina-canalda-250457132/)
[![GitHub](https://img.shields.io/badge/GitHub-f4b8d4?style=flat-square&logo=github&logoColor=2d1b6e)](https://github.com/mee96)

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=c5b9f0&height=110&section=footer" width="100%" alt="footer" />

</div>
