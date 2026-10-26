<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=a8c4f0&height=180&section=header&text=✦%20Nikkura%20✦&fontColor=2d1b6e&fontSize=34&desc=tu%20diario%20y%20almac%C3%A9n%20de%20anime&descSize=16&descColor=2d1b6e&descAlignY=65&fontAlignY=42" width="100%" alt="Nikkura" />

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
[![Tablero](https://img.shields.io/badge/📋_Tablero_del_proyecto-c5b9f0?style=flat-square&logoColor=2d1b6e)](../../projects)
&nbsp;
[![Diseño](https://img.shields.io/badge/🎨_Diseño-f4b8d4?style=flat-square&logoColor=2d1b6e)](docs/DESIGN.md)

</div>

<br/>

> **日記蔵 · Nikkura** une *Nikki* (日記, diario) y *Kura* (蔵, almacén): un lugar personal para guardar y ordenar las historias que ves.

> [!NOTE]
> 🚧 **En desarrollo.** El diseño y las bases (milestone M0) están hechos: las apps de Angular y FastAPI, el CI y los tokens de diseño de los cuatro temas. Las funcionalidades llegan milestone a milestone en el [tablero del proyecto](../../projects).

<br/>

---

## <img src="https://api.iconify.design/ph/question-fill.svg?color=%23FF6FA8&height=24" height="22"> &nbsp;¿Qué es?

**Nikkura** es una app para descubrir anime donde **tu rol da forma a toda la experiencia**. Al registrarte eliges un rol (Moe Magical, Haku Sama o Senpai) y este decide los colores de la interfaz, el mundo de la ficha de cada anime y las recomendaciones que recibes. Las visitas pueden explorar, buscar y leerlo todo sin cuenta.

Construida como **monorepo**: un frontend en **Angular 21** que lee los datos de anime directamente de la **API pública de Jikan** (MyAnimeList), y un backend en **FastAPI** que solo guarda los datos de usuario (perfiles, tu Kura, puntuaciones, comentarios y chat) en **MySQL en Aiven**, con autenticación de **Firebase**.

<br/>

---

## <img src="https://api.iconify.design/ph/sparkle-fill.svg?color=%235B9BD5&height=24" height="22"> &nbsp;Funcionalidades

* <img src="https://api.iconify.design/ph/palette-fill.svg?color=%23FF6FA8&height=18" height="16"> **Cuatro temas:** Moe Magical, Haku Sama, Senpai y la vista de visitante, cada uno con su paleta, sus fuentes y su ficha de anime. *(tokens de diseño listos)*
* <img src="https://api.iconify.design/ph/magnifying-glass-fill.svg?color=%235B9BD5&height=18" height="16"> **Búsqueda y filtros:** por título, tipo, género, temática, demografía y puntuación. *(previsto · M1)*
* <img src="https://api.iconify.design/ph/archive-fill.svg?color=%23B372CF&height=18" height="16"> **Tu Kura:** carpetas para guardar anime, con tu propia nota y una nota privada en cada uno. *(previsto · M3)*
* <img src="https://api.iconify.design/ph/chats-circle-fill.svg?color=%232FB5AE&height=18" height="16"> **Comunidad:** puntuación media y comentarios públicos en cada anime. *(previsto · M4)*
* <img src="https://api.iconify.design/ph/users-three-fill.svg?color=%23E0A63B&height=18" height="16"> **Seguir y compartir:** sigue a personas y sus carpetas, y recomienda anime a tus amistades. *(previsto · M5)*
* <img src="https://api.iconify.design/ph/lightning-fill.svg?color=%23FF6FA8&height=18" height="16"> **Chat en directo:** una sala por WebSocket en cada anime y chat privado entre amistades. *(previsto · M6)*
* <img src="https://api.iconify.design/ph/shield-check-fill.svg?color=%235B9BD5&height=18" height="16"> **Contenido seguro:** sin contenido para adultos para nadie: el hentai, el erotica y el ecchi no se piden ni se muestran nunca.
* <img src="https://api.iconify.design/ph/translate-fill.svg?color=%232FB5AE&height=18" height="16"> **Multilingüe:** catalán, castellano e inglés. *(previsto · M1)*

<br/>

---

## <img src="https://api.iconify.design/ph/image-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Capturas

*Mockups de diseño. Todas las pantallas, en escritorio y móvil, están en [`docs/DESIGN.md`](docs/DESIGN.md).*

<div align="center">
  <img src="docs/screenshots/design/home-desktop-moe-magical.png" width="45%" alt="Inicio, Moe Magical" />
  &nbsp;
  <img src="docs/screenshots/design/detail-desktop-senpai.png" width="45%" alt="Ficha de anime, Senpai" />
  <br/><br/>
  <img src="docs/screenshots/design/detail-desktop-haku-sama.png" width="45%" alt="Ficha de anime, Haku Sama" />
  &nbsp;
  <img src="docs/screenshots/design/signup-desktop-visitor.png" width="45%" alt="Registro con selector de rol" />
</div>

<br/>

---

## <img src="https://api.iconify.design/ph/stack-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Tecnologías

| Capa | Tecnología |
| :--- | :--- |
| <img src="https://api.iconify.design/ph/desktop-tower-fill.svg?color=%23FF6FA8&height=18" height="16"> **Frontend** | Angular 21 · componentes standalone · signals · SCSS con tokens de diseño · Vitest · ESLint · Stylelint |
| <img src="https://api.iconify.design/ph/cpu-fill.svg?color=%23B372CF&height=18" height="16"> **Backend** | FastAPI · Python 3.12 · SQLAlchemy · pytest · Ruff |
| <img src="https://api.iconify.design/ph/database-fill.svg?color=%235B9BD5&height=18" height="16"> **Base de datos** | MySQL en Aiven (SSL) |
| <img src="https://api.iconify.design/ph/key-fill.svg?color=%232FB5AE&height=18" height="16"> **Autenticación** | Firebase Authentication |
| <img src="https://api.iconify.design/ph/film-strip-fill.svg?color=%23FF6FA8&height=18" height="16"> **Datos de anime** | API de Jikan v4 (MyAnimeList), llamada desde el navegador |
| <img src="https://api.iconify.design/ph/rocket-launch-fill.svg?color=%23E0A63B&height=18" height="16"> **Despliegue** | Render (static site + web service) · Aiven |

<br/>

---

## <img src="https://api.iconify.design/ph/folder-fill.svg?color=%232FB5AE&height=24" height="22"> &nbsp;Estructura del proyecto

<pre><code>Nikkura/
├── 🐍 backend/
│   ├── app/
│   │   ├── main.py          app de FastAPI, CORS, routers
│   │   ├── core/config.py   configuración, géneros por rol, reglas de contenido
│   │   ├── routers/         endpoints (de momento, health)
│   │   ├── schemas/         modelos de Pydantic
│   │   ├── models/          tablas de la base de datos
│   │   ├── services/        lógica de negocio
│   │   └── utils/db.py      conexión a MySQL
│   └── tests/
│
├── 🅰️ frontend/
│   └── src/
│       ├── styles/variables.css   todos los tokens de diseño, un bloque por tema
│       ├── environments/          configuración local y de producción
│       └── app/
│           ├── core/              servicios (ThemeService…)
│           ├── features/          una carpeta por pantalla
│           └── shared/            componentes reutilizables
│
└── 📐 docs/
    ├── DESIGN.md            roles, paletas, navegación, breakpoints, i18n
    └── screenshots/design/  mockups</code></pre>

<br/>

---

## <img src="https://api.iconify.design/ph/code-bold.svg?color=%235B9BD5&height=24" height="22"> &nbsp;Endpoints principales

El backend crece con cada milestone. La referencia completa y siempre actualizada es la documentación interactiva en `/docs`.

### <img src="https://api.iconify.design/ph/heartbeat-fill.svg?color=%23E0A63B&height=20" height="18"> Estado
<pre><code>GET    /health        → Estado del servicio y comprobación de la base de datos (200 ok · 503 degraded)</code></pre>

<br/>

---

## <img src="https://api.iconify.design/ph/play-fill.svg?color=%23B372CF&height=24" height="22"> &nbsp;Ejecutar en local

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env             # Rellena las credenciales de Aiven
uvicorn app.main:app --reload
```

> `http://localhost:8000/health` debería responder `{"status": "ok", "database": "up"}`, y `http://localhost:8000/docs` muestra la API.

> [!TIP]
> En Windows, si Smart App Control o una política de empresa bloquea SQLAlchemy (`DLL load failed`), ejecútalo en Python puro:
> PowerShell `$env:DISABLE_SQLALCHEMY_CEXT_RUNTIME = "1"` · cmd `setx DISABLE_SQLALCHEMY_CEXT_RUNTIME 1`.

### Frontend

```bash
cd frontend
npm install
npm start
```

> Abre `http://localhost:4200` ✨

### Tests y lint

```bash
cd backend  && pytest -q && ruff check . && ruff format --check .
cd frontend && npm test -- --watch=false && npm run lint
```

<br/>

---

## <img src="https://api.iconify.design/ph/sliders-horizontal-fill.svg?color=%23FF6FA8&height=24" height="22"> &nbsp;Variables de entorno

Crea un archivo `.env` en `backend/` (ver `backend/.env.example`):

```env
ENVIRONMENT=local            # local o production
DB_HOST=...
DB_PORT=...
DB_NAME=nikkura
DB_USER=...
DB_PASSWORD=...
DB_SSL_CA=./ca.pem           # certificado CA de la consola de Aiven (nunca se sube al repo)
CORS_ORIGINS=http://localhost:4200
```

La configuración del frontend (URL del backend, URL de Jikan, configuración web de Firebase) está en `frontend/src/environments/`.

<br/>

---

## <img src="https://api.iconify.design/ph/git-branch-fill.svg?color=%232FB5AE&height=24" height="22"> &nbsp;Forma de trabajo

* <img src="https://api.iconify.design/ph/git-branch-bold.svg?color=%232FB5AE&height=16" height="14"> **Gitflow:** `main` (producción) · `develop` (integración) · ramas `feature/*`, `fix/*`, `chore/*`, `docs/*` que entran por pull request.
* <img src="https://api.iconify.design/ph/git-commit-bold.svg?color=%232FB5AE&height=16" height="14"> **Conventional Commits:** `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`…
* <img src="https://api.iconify.design/ph/kanban-bold.svg?color=%232FB5AE&height=16" height="14"> **Planificación:** issues con etiquetas y un milestone por fase (de M0 diseño y bases a M7 pulido), en el [tablero del proyecto](../../projects).
* <img src="https://api.iconify.design/ph/check-circle-bold.svg?color=%232FB5AE&height=16" height="14"> **CI:** GitHub Actions pasa el lint, compila y prueba el frontend y el backend en cada pull request.
* <img src="https://api.iconify.design/ph/paint-brush-bold.svg?color=%232FB5AE&height=16" height="14"> **Primero el diseño:** cada pantalla se diseñó para los cuatro temas antes de programar, ver [`docs/DESIGN.md`](docs/DESIGN.md).

<br/>

---

<div align="center">

*Hecho para tener en un solo lugar el anime que me gusta, y porque cada forma de ver anime merece su propio mundo.* 🌸

<br/><br/>

Desarrollado por **Carme Medina Canalda**<br/>
*Full Stack Developer · Barcelona*

<br/>

[![Portfolio](https://img.shields.io/badge/Portfolio-c5b9f0?style=flat-square&logoColor=2d1b6e)](https://carme-portfoli.onrender.com/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-a8c4f0?style=flat-square&logo=linkedin&logoColor=2d1b6e)](https://www.linkedin.com/in/carme-medina-canalda-250457132/)
[![GitHub](https://img.shields.io/badge/GitHub-f4b8d4?style=flat-square&logo=github&logoColor=2d1b6e)](https://github.com/mee96)

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=a8c4f0&height=110&section=footer" width="100%" alt="footer" />

</div>
