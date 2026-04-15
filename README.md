# Electron + TypeScript + React + Vite

A desktop starter: **Electron** as the shell, **React** in the renderer (Vite + HMR), and **TypeScript** across the board — main process, preload, and UI. IPC is typed end-to-end via globals in `types.d.ts` so channels and payloads stay in sync.

---

## Stack (what this repo ships with)

| Layer           | Tech                    | Notes                                                                                  |
| --------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| Desktop         | Electron `^34`          | Production entry: `dist-electron/main.js` (`package.json` → `main`)                    |
| Renderer        | React `^19` + Vite `^6` | `@vitejs/plugin-react`, build output goes to `dist-react/`                             |
| TS              | `~5.7`                  | Strict mode; renderer uses `tsconfig.app.json`, Vite tooling uses `tsconfig.node.json` |
| Main / preload  | TS → `dist-electron/`   | `src/electron/tsconfig.json`, `module`: NodeNext (output follows sources: ESM / CJS)   |
| Package manager | **pnpm**                | `.npmrc`: `node-linker=hoisted`                                                        |
| Lint            | ESLint `^9` (flat)      | `typescript-eslint` recommended + React Hooks + React Refresh                          |
| Shipping        | electron-builder        | Config in `electron-builder.json`                                                      |

**Node.js:** **18+** — the main process already touches APIs like `fs.statfsSync` that expect a modern runtime.

---

## Project layout (quick map)

```
├── index.html              # Vite root; entry → src/ui/main.tsx
├── vite.config.ts          # Dev port 4006, outDir dist-react, base './'
├── electron-builder.json   # DMG / portable+NSIS / AppImage, preload in extraResources
├── types.d.ts              # IPC contract + `Window['electron']`
├── src/
│   ├── ui/                 # React (Vite)
│   └── electron/           # Main, preload, utils → dist-electron/ after transpile
└── dist-electron/          # Output of `pnpm transpile:electron` (main.js, preload.cjs, …)
```

- **Dev:** with `NODE_ENV=development`, the window loads `http://localhost:4006` — see `src/electron/utils.ts`.
- **Prod:** loads `dist-react/index.html` from the packaged app.

---

## Conventions & ground rules

1. **TypeScript** — `strict` plus tight unused locals/params (see `tsconfig.app.json` & `src/electron/tsconfig.json`).
2. **ESLint** — `**/*.{ts,tsx}`, Hooks + Fast Refresh; `dist` is ignored. Quick pass: `pnpm lint`.
3. **IPC** — new channel or payload? Update `types.d.ts` first (`EventPayloadMapping`, `Window`, etc.) so main ↔ preload ↔ renderer share one source of truth.
4. **Main-process imports** — relative imports to compiled files use a `.js` suffix (e.g. `./utils.js`). That’s the NodeNext pattern, not a mistake.
5. **Preload** — `preload.cts` compiles to `preload.cjs`; paths are wired in `path-resolver.ts` + `electron-builder.json`.

---

## Prerequisites

- [Node.js](https://nodejs.org/) **18+**
- [pnpm](https://pnpm.io/) — scripts in this repo assume pnpm

Install dependencies:

```bash
pnpm install
```

---

## Development

`pnpm dev` runs **two processes** side by side: Vite (renderer) and Electron (main). In practice:

```bash
pnpm dev
```

Under the hood that’s `concurrently`:

- `pnpm dev:react` → `vite` (dev server on **port 4006**, `strictPort: true` — another port won’t silently win)
- `pnpm dev:electron` → `electron .` with `NODE_ENV=development`

**Windows note:** `dev:electron` uses Unix-style `NODE_ENV=development`. If the variable doesn’t apply in your shell, Electron may not hit the dev server (won’t load `localhost:4006`). Fix: set `NODE_ENV=development` manually, or adjust the script (e.g. `cross-env` — already in devDependencies).

Preview the renderer build without Electron:

```bash
pnpm preview
```

---

## Build

### Renderer only (`tsc -b` + Vite)

```bash
pnpm build
```

Output: **`dist-react/`** (plus typecheck via the root project references).

### Main + preload (Electron)

```bash
pnpm transpile:electron
```

Output: **`dist-electron/`** (including `main.js` referenced by the `main` field).

**Order before packaging:** transpile Electron, then build the renderer — the `dist:*` scripts already run them in that order.

---

## Distribution (artifacts / installers)

Each command runs: **`transpile:electron` → `build` → `electron-builder`** for the target OS.

| Command           | OS      | Target (from `electron-builder.json` + script flags) |
| ----------------- | ------- | ---------------------------------------------------- |
| `pnpm dist:mac`   | macOS   | DMG (`arm64` in script)                              |
| `pnpm dist:win`   | Windows | Portable + NSIS (`x64`)                              |
| `pnpm dist:linux` | Linux   | AppImage (`x64`)                                     |

Before a production release, tweak `appId`, the icon (`desktopIconx512.png`), and architecture targets in `electron-builder.json` / `package.json` scripts as needed.

---

## Command cheat sheet

| Command                                     | What it does                                                |
| ------------------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                                  | Full dev: Vite + Electron                                   |
| `pnpm dev:react`                            | Vite only                                                   |
| `pnpm dev:electron`                         | Electron only (usually paired manually with the dev server) |
| `pnpm build`                                | `tsc -b` + Vite → `dist-react/`                             |
| `pnpm transpile:electron`                   | `src/electron` → `dist-electron/`                           |
| `pnpm lint`                                 | ESLint                                                      |
| `pnpm preview`                              | Static preview of the Vite build                            |
| `pnpm dist:mac` / `dist:win` / `dist:linux` | Packaged artifact for that platform                         |
