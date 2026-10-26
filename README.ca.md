<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=a8c4f0&height=180&section=header&text=✦%20Nikkura%20✦&fontColor=2d1b6e&fontSize=34&desc=el%20teu%20diari%20i%20magatzem%20d'anime&descSize=16&descColor=2d1b6e&descAlignY=65&fontAlignY=42" width="100%" alt="Nikkura" />

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
[![Tauler](https://img.shields.io/badge/📋_Tauler_del_projecte-c5b9f0?style=flat-square&logoColor=2d1b6e)](../../projects)
&nbsp;
[![Disseny](https://img.shields.io/badge/🎨_Disseny-f4b8d4?style=flat-square&logoColor=2d1b6e)](docs/DESIGN.md)

</div>

<br/>

> **日記蔵 · Nikkura** uneix *Nikki* (日記, diari) i *Kura* (蔵, magatzem): un lloc personal per guardar i ordenar les històries que mires.

> [!NOTE]
> 🚧 **En desenvolupament.** El disseny i les bases (milestone M0) estan fets: les apps d'Angular i FastAPI, el CI i els tokens de disseny dels quatre temes. Les funcionalitats arriben milestone a milestone al [tauler del projecte](../../projects).

<br/>

---

## <img src="https://api.iconify.design/ph/question-fill.svg?color=%23FF6FA8&height=24" height="22"> &nbsp;Què és?

**Nikkura** és una app per descobrir anime on **el teu rol dona forma a tota l'experiència**. Quan et registres tries un rol (Moe Magical, Haku Sama o Senpai) i aquest decideix els colors de la interfície, el món de la fitxa de cada anime i les recomanacions que reps. Les visites poden explorar, cercar i llegir-ho tot sense compte.

Construïda com a **monorepo**: un frontend en **Angular 21** que llegeix les dades d'anime directament de l'**API pública de Jikan** (MyAnimeList), i un backend en **FastAPI** que només desa les dades d'usuari (perfils, el teu Kura, puntuacions, comentaris i xat) a **MySQL a Aiven**, amb autenticació de **Firebase**.

<br/>

---

## <img src="https://api.iconify.design/ph/sparkle-fill.svg?color=%235B9BD5&height=24" height="22"> &nbsp;Funcionalitats

* <img src="https://api.iconify.design/ph/palette-fill.svg?color=%23FF6FA8&height=18" height="16"> **Quatre temes:** Moe Magical, Haku Sama, Senpai i la vista de visitant, cadascun amb la seva paleta, les seves fonts i la seva fitxa d'anime. *(tokens de disseny llestos)*
* <img src="https://api.iconify.design/ph/magnifying-glass-fill.svg?color=%235B9BD5&height=18" height="16"> **Cerca i filtres:** per títol, tipus, gènere, temàtica, demografia i puntuació. *(previst · M1)*
* <img src="https://api.iconify.design/ph/archive-fill.svg?color=%23B372CF&height=18" height="16"> **El teu Kura:** carpetes per guardar anime, amb la teva nota i una nota privada a cadascun. *(previst · M3)*
* <img src="https://api.iconify.design/ph/chats-circle-fill.svg?color=%232FB5AE&height=18" height="16"> **Comunitat:** puntuació mitjana i comentaris públics a cada anime. *(previst · M4)*
* <img src="https://api.iconify.design/ph/users-three-fill.svg?color=%23E0A63B&height=18" height="16"> **Seguir i compartir:** segueix persones i les seves carpetes, i recomana anime a les teves amistats. *(previst · M5)*
* <img src="https://api.iconify.design/ph/lightning-fill.svg?color=%23FF6FA8&height=18" height="16"> **Xat en directe:** una sala per WebSocket a cada anime i xat privat entre amistats. *(previst · M6)*
* <img src="https://api.iconify.design/ph/shield-check-fill.svg?color=%235B9BD5&height=18" height="16"> **Contingut segur:** sense contingut sexual per a ningú: l'hentai i l'erotica no es mostren mai, i l'ecchi porta una marca +18.
* <img src="https://api.iconify.design/ph/translate-fill.svg?color=%232FB5AE&height=18" height="16"> **Multilingüe:** català, castellà i anglès. *(previst · M1)*

<br/>

---

## <img src="https://api.iconify.design/ph/image-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Captures

*Mockups de disseny. Totes les pantalles, en escriptori i mòbil, són a [`docs/DESIGN.md`](docs/DESIGN.md).*

<div align="center">
  <img src="docs/screenshots/design/home-desktop-moe-magical.png" width="45%" alt="Inici, Moe Magical" />
  &nbsp;
  <img src="docs/screenshots/design/detail-desktop-senpai.png" width="45%" alt="Fitxa d'anime, Senpai" />
  <br/><br/>
  <img src="docs/screenshots/design/detail-desktop-haku-sama.png" width="45%" alt="Fitxa d'anime, Haku Sama" />
  &nbsp;
  <img src="docs/screenshots/design/signup-desktop-visitor.png" width="45%" alt="Registre amb selector de rol" />
</div>

<br/>

---

## <img src="https://api.iconify.design/ph/stack-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Tecnologies

| Capa | Tecnologia |
| :--- | :--- |
| <img src="https://api.iconify.design/ph/desktop-tower-fill.svg?color=%23FF6FA8&height=18" height="16"> **Frontend** | Angular 21 · components standalone · signals · SCSS amb tokens de disseny · Vitest · ESLint · Stylelint |
| <img src="https://api.iconify.design/ph/cpu-fill.svg?color=%23B372CF&height=18" height="16"> **Backend** | FastAPI · Python 3.12 · SQLAlchemy · pytest · Ruff |
| <img src="https://api.iconify.design/ph/database-fill.svg?color=%235B9BD5&height=18" height="16"> **Base de dades** | MySQL a Aiven (SSL) |
| <img src="https://api.iconify.design/ph/key-fill.svg?color=%232FB5AE&height=18" height="16"> **Autenticació** | Firebase Authentication |
| <img src="https://api.iconify.design/ph/film-strip-fill.svg?color=%23FF6FA8&height=18" height="16"> **Dades d'anime** | API de Jikan v4 (MyAnimeList), cridada des del navegador |
| <img src="https://api.iconify.design/ph/rocket-launch-fill.svg?color=%23E0A63B&height=18" height="16"> **Desplegament** | Render (static site + web service) · Aiven |

<br/>

---

## <img src="https://api.iconify.design/ph/folder-fill.svg?color=%232FB5AE&height=24" height="22"> &nbsp;Estructura del projecte

<pre><code>Nikkura/
├── 🐍 backend/
│   ├── app/
│   │   ├── main.py          app de FastAPI, CORS, routers
│   │   ├── core/config.py   configuració, gèneres per rol, regles de contingut
│   │   ├── routers/         endpoints (de moment, health)
│   │   ├── schemas/         models de Pydantic
│   │   ├── models/          taules de la base de dades
│   │   ├── services/        lògica de negoci
│   │   └── utils/db.py      connexió a MySQL
│   └── tests/
│
├── 🅰️ frontend/
│   └── src/
│       ├── styles/variables.css   tots els tokens de disseny, un bloc per tema
│       ├── environments/          configuració local i de producció
│       └── app/
│           ├── core/              serveis (ThemeService…)
│           ├── features/          una carpeta per pantalla
│           └── shared/            components reutilitzables
│
└── 📐 docs/
    ├── DESIGN.md            rols, paletes, navegació, breakpoints, i18n
    └── screenshots/design/  mockups</code></pre>

<br/>

---

## <img src="https://api.iconify.design/ph/code-bold.svg?color=%235B9BD5&height=24" height="22"> &nbsp;Endpoints principals

El backend creix amb cada milestone. La referència completa i sempre al dia és la documentació interactiva a `/docs`.

### <img src="https://api.iconify.design/ph/heartbeat-fill.svg?color=%23E0A63B&height=20" height="18"> Estat
<pre><code>GET    /health        → Estat del servei i comprovació de la base de dades (200 ok · 503 degraded)</code></pre>

<br/>

---

## <img src="https://api.iconify.design/ph/play-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Executar en local

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env             # Omple les credencials d'Aiven
uvicorn app.main:app --reload
```

> `http://localhost:8000/health` hauria de respondre `{"status": "ok", "database": "up"}`, i `http://localhost:8000/docs` mostra l'API.

> [!TIP]
> A Windows, si Smart App Control o una política d'empresa bloqueja SQLAlchemy (`DLL load failed`), executa'l en Python pur:
> PowerShell `$env:DISABLE_SQLALCHEMY_CEXT_RUNTIME = "1"` · cmd `setx DISABLE_SQLALCHEMY_CEXT_RUNTIME 1`.

### Frontend

```bash
cd frontend
npm install
npm start
```

> Obre `http://localhost:4200` ✨

### Tests i lint

```bash
cd backend  && pytest -q && ruff check . && ruff format --check .
cd frontend && npm test -- --watch=false && npm run lint
```

<br/>

---

## <img src="https://api.iconify.design/ph/sliders-horizontal-fill.svg?color=%23FF6FA8&height=24" height="22"> &nbsp;Variables d'entorn

Crea un fitxer `.env` a `backend/` (mira `backend/.env.example`):

```env
ENVIRONMENT=local            # local o production
DB_HOST=...
DB_PORT=...
DB_NAME=nikkura
DB_USER=...
DB_PASSWORD=...
DB_SSL_CA=./ca.pem           # certificat CA de la consola d'Aiven (mai no es puja al repo)
CORS_ORIGINS=http://localhost:4200
```

La configuració del frontend (URL del backend, URL de Jikan, configuració web de Firebase) és a `frontend/src/environments/`.

<br/>

---

## <img src="https://api.iconify.design/ph/git-branch-fill.svg?color=%232FB5AE&height=24" height="22"> &nbsp;Forma de treballar

* <img src="https://api.iconify.design/ph/git-branch-bold.svg?color=%232FB5AE&height=16" height="14"> **Gitflow:** `main` (producció) · `develop` (integració) · branques `feature/*`, `fix/*`, `chore/*`, `docs/*` que entren per pull request.
* <img src="https://api.iconify.design/ph/git-commit-bold.svg?color=%232FB5AE&height=16" height="14"> **Conventional Commits:** `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`…
* <img src="https://api.iconify.design/ph/kanban-bold.svg?color=%232FB5AE&height=16" height="14"> **Planificació:** issues amb etiquetes i un milestone per fase (de M0 disseny i bases a M7 poliment), al [tauler del projecte](../../projects).
* <img src="https://api.iconify.design/ph/check-circle-bold.svg?color=%232FB5AE&height=16" height="14"> **CI:** GitHub Actions passa el lint, compila i prova el frontend i el backend a cada pull request.
* <img src="https://api.iconify.design/ph/paint-brush-bold.svg?color=%232FB5AE&height=16" height="14"> **Primer el disseny:** cada pantalla es va dissenyar per als quatre temes abans de programar, mira [`docs/DESIGN.md`](docs/DESIGN.md).

<br/>

---

<div align="center">

*Fet per tenir en un sol lloc l'anime que m'agrada, i perquè cada manera de mirar anime es mereix el seu propi món.* 🌸

<br/><br/>

Desenvolupat per **Carme Medina Canalda**<br/>
*Full Stack Developer · Barcelona*

<br/>

[![Portfolio](https://img.shields.io/badge/Portfolio-c5b9f0?style=flat-square&logoColor=2d1b6e)](https://carme-portfoli.onrender.com/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-a8c4f0?style=flat-square&logo=linkedin&logoColor=2d1b6e)](https://www.linkedin.com/in/carme-medina-canalda-250457132/)
[![GitHub](https://img.shields.io/badge/GitHub-f4b8d4?style=flat-square&logo=github&logoColor=2d1b6e)](https://github.com/mee96)

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=a8c4f0&height=110&section=footer" width="100%" alt="footer" />

</div>
