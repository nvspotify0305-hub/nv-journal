# NV Journal — Deploy Reference
> Read this before any deploy action. Follow exactly — no improvisation.

---

## Architecture

- **No build step.** `NVJournal_source.html` is pre-compiled React 18 (Babel-transformed, UMD).
- `build.js` exists in nvbuild but is **not required** for standard deploys.
- React 18 loaded via CDN (`unpkg.com`) — no bundler, no npm build.
- Deploy = copy source → rename → git push. That's it.

---

## Folder Structure

```
C:\Users\creditcontrol\nvbuild\
├── .claude\              # Claude Code config
├── .github\              # GitHub Actions (if any)
├── archive\              # Old source versions — never delete
├── node_modules\         # Present but not used in deploy
├── template\             # NV Template app (separate — never merge)
├── .gitignore
├── babel.config.json
├── build.js
├── Claude.md
├── GRADE_ENGINE.md
├── SUPABASE.md
├── ROADMAP.md
├── NV_SYSTEM.md
├── DEPLOY.md
├── index.html            # ← DEPLOYED FILE (GitHub Pages serves this)
├── NVJournal_source.html # ← WORKING FILE (edit this)
├── package.json
├── package-lock.json
└── README.md
```

---

## Working File Rule

| File | Purpose |
|------|---------|
| `NVJournal_source.html` | **Always edit this.** Never edit index.html directly. |
| `index.html` | Deploy target only. Overwritten on every deploy. |

---

## Version Bump Rule

**Every deploy requires a version bump — no exceptions.**

Find and update the footer string in `NVJournal_source.html`:

```
"NV JOURNAL - vXX"
```

Increment XX by 1. Current: **v60**.

---

## Standard Deploy — Windows CMD

```cmd
cd C:\Users\creditcontrol\nvbuild
copy NVJournal_source.html index.html
git add index.html
git commit -m "vXX"
git push
```

Replace `XX` with the new version number.

---

## Archive Before Major Changes

Before any significant feature work, archive the current source:

```cmd
copy NVJournal_source.html archive\NVJournal_vXX_source.html
```

---

## Git Remote

| Key | Value |
|-----|-------|
| Repo | `nvspotify0305-hub/nv-journal` |
| Local branch | `master` |
| Remote branch | `main` |
| Live URL | `https://nvspotify0305-hub.github.io/nv-journal` |

---

## Known Warnings (non-breaking)

| Warning | Cause | Action |
|---------|-------|--------|
| LF/CRLF warning on `git add` | Windows line endings | Ignore — non-breaking |

---

## Propagation

- GitHub Pages deploys in **~30–60 seconds** after push
- Hard refresh required to clear browser cache: `Ctrl+Shift+R`
- Mobile: clear site data if cached version persists

---

## Claude Code Deploy Checklist

Before pushing any version:
- [ ] Footer string bumped (`"NV JOURNAL - vXX"`)
- [ ] Working file is `NVJournal_source.html`
- [ ] `copy NVJournal_source.html index.html` run
- [ ] Commit message matches version number
- [ ] Previous version archived if major change

---

## What Claude Code Must Never Do

- Edit `index.html` directly
- Push without bumping the version string
- Merge NV Template (`template\`) into NV Journal source
- Run `npm build` or any bundler — not part of this pipeline
- Delete or overwrite anything in `archive\`
