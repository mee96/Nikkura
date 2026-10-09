# Project guide

How every project of mine is set up and documented. This repo is a **GitHub template**:
new projects start from **Use this template → Create a new repository** and inherit everything below.

---

## 1. After creating a project from the template

- [ ] **About** (gear icon on the repo page): one-line English description in the format
      `What it is — what it does. Stack.` + website URL + topics (stack, hosting, domain).
- [ ] **READMEs**: delete the *template repository* note at the top, replace every `✏️` comment in `README.md`, then mirror the changes in
      `README.es.md` and `README.ca.md`. Delete the `✏️` comments.
- [ ] **Labels**: Actions → *Sync labels* → *Run workflow* (creates the labels in `.github/labels.yml`).
- [ ] **Branches**: create `develop` from `main`; set `develop` as the default branch for daily work.
- [ ] **Branch protection** (Settings → Rules): `main` and `develop` only via pull request, with CI passing.
- [ ] **Project board** (Projects → New project → Board): columns *Backlog · Ready · In progress · In review · Done*,
      grouped by milestone. Link it to the repo.
- [ ] **Milestones**: one per phase (e.g. `v0.1 · MVP`, `v0.2 · …`).
- [ ] **CHANGELOG.md** and a first release `v0.1.0` when the MVP works.
- [ ] Remove sections that don't apply (e.g. *Main Endpoints* in a frontend-only project).

---

## 2. README rules

**Three languages, one structure.** `README.md` (English) is the source; `README.es.md` and
`README.ca.md` have exactly the same sections in the same order. Every change goes to all three.
The language badges at the top use relative links, so they work in any repo.

**Section order** (skip a section only if it really doesn't apply):

| # | Section | What goes in it |
|---|---|---|
| — | Header | Capsule wave with the project name and a one-line tagline, language badges, stack badges, link badges |
| 1 | What is this? | Two short paragraphs: what it does and for whom; how it is built |
| 2 | Key Features | 4–8 bullets: icon + **Name:** what the user can do |
| 3 | Screenshots | 1–3 images or a GIF of the main flow, from `docs/screenshots/` |
| 4 | Technology Stack | Table *Layer · Technology* |
| 5 | Project Structure | Folder tree, only the meaningful levels |
| 6 | Main Endpoints | Grouped by resource; the full reference is in `/docs` |
| 7 | Run Locally | Backend and frontend commands |
| 8 | Environment Variables | Names only, never values; mirrors `backend/.env.example` |
| 9 | Workflow | Gitflow, Conventional Commits, planning, CI |
| — | Footer | One personal line on why I built it, author, Portfolio · LinkedIn · GitHub badges, footer wave |

**Visual style**

- **Header and footer**: `capsule-render` *waving*, `fontColor=2d1b6e`. Header and footer use the
  **same pastel**, chosen per project so each repo has its own colour:

  | Pastel | Hex | Used in |
  |---|---|---|
  | Lilac | `c5b9f0` | Profile, default |
  | Pink | `f4b8d4` | SkinCareApp |
  | Blue | `a8c4f0` | |
  | Mint | `b8e8d4` | |
  | Butter | `f0e4a0` | |

- **Stack badges**: shields.io `for-the-badge`, pastel background, `logoColor=2d1b6e`,
  label + detail (`Python-FastAPI`, `Angular-21`, `MySQL-Aiven`). Rotate the pastels in the order above.
- **Link badges**: shields.io `flat-square` with an emoji (`🌐 Live Demo`, `📖 API Docs`, `🐛 Issues`, `📋 Project board`).
  Add the Render cold-start badge only for projects on the free tier.
- **Section icons**: [Phosphor](https://phosphoricons.com/) via `api.iconify.design/ph/<name>-fill.svg`,
  height 24 for `##` titles, 18 for list items. Accent colours: `FF6FA8` pink · `B372CF` purple ·
  `5B9BD5` blue · `2FB5AE` teal · `E0A63B` amber.
- Sections are separated by `<br/>` + `---`.
- Endpoint lists and folder trees go in `<pre><code>` blocks; commands in fenced ```` ```bash ```` blocks.

**Tone**: short, concrete, first person in the footer only. No claims the repo can't back up
(if it's in a badge, it's in the code).

---

## 3. Git workflow

- **Branches (Gitflow)**: `main` = production · `develop` = integration ·
  `feature/<issue>-short-name`, `fix/<issue>-short-name`, `chore/…`, `docs/…` from `develop` ·
  `release/x.y.z` and `hotfix/…` only when needed.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `refactor:`,
  `chore:`, `docs:`, `test:`, optional scope (`feat(auth): …`).
- **Issues**: opened with the templates (bug / feature), with type + area + priority labels and a milestone.
- **Pull requests**: one issue per PR, `Closes #N` in the description (the issue closes and the card
  moves to *Done* on merge), checklist from the PR template ticked.
- **Releases**: tag `vX.Y.Z` on `main`, notes taken from `CHANGELOG.md`.

---

## 4. What's in this template

```
.github/
├── ISSUE_TEMPLATE/      bug_report.yml · feature_request.yml · config.yml
├── pull_request_template.md
├── labels.yml           shared label set (type · area · priority · status)
└── workflows/
    ├── ci.yml           builds frontend/ and checks backend/ (each job skips until its folder is set up)
    └── sync-labels.yml  applies labels.yml to the repo
backend/.env.example
frontend/
docs/screenshots/
docs/README_GUIDE.md     this file
README.md · README.es.md · README.ca.md
CHANGELOG.md · .gitignore · .editorconfig
```
