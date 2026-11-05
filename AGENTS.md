# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

Chordcharts is a static, no-build website for viewing and transposing worship/pop
chord charts. It is deployed to GitHub Pages at
`https://ericwegscheid.github.io/chordcharts/`.

The app is plain HTML, CSS, and vanilla JavaScript. There is no package manager,
bundler, framework, transpiler, or automated test suite. Do not introduce one
unless explicitly asked.

## How to run

There is nothing to install or build. Open `index.html` through a local HTTP
server (the app loads charts with `XMLHttpRequest`, so `file://` may be blocked
by CORS):

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

There is no lint, typecheck, or test command. Verify changes manually in a
browser, and keep the browser console free of errors.

## File map

| Path | Purpose |
| --- | --- |
| `index.html` | App shell/markup. Buttons use inline `onclick` calling globals. |
| `manifest.json` | PWA manifest: name, theme colors, start URL, and icons. |
| `sw.js` | Service worker: precaches the app shell and runtime-caches same-origin files. |
| `js/pwa.js` | Registers the service worker after page load. |
| `data.js` | `window._data`: default state plus a manually maintained list of chart paths. |
| `js/common.js` | `window.__`: type checks, DOM select, XHR `get`, query params, clipboard. |
| `js/proc.js` | `window._proc`: chart metadata from filenames, text parsing, transposition. |
| `js/render.js` | `window._render`: generates menu, queue, and chart HTML. |
| `js/action.js` | `window._action`: user actions and state mutation. |
| `js/app.js` | `window._app`: init, localStorage, URL params, keyboard handling. |
| `css/common.css` | Layout and component styling. |
| `css/theme.css` | Colors, variables, dark mode. |
| `css/print.css` | Print-only layout. |
| `charts/<category>/<Song>.ccl` | Song chart source files. |
| `icons/*` | App/PWA icons (PNG sizes plus `icon.svg`, generated with no external tooling). |
| `audio/*.mp3` | Present but currently unused/unreferenced. |
| `current.html` | Legacy link to a saved queue URL. |

Categories in use: `christmas`, `kids`, `secular`, `wedding`, `worship`.

## Architecture and conventions

- Scripts are plain `<script>` tags sharing globals. Modules are IIFEs that
  attach to namespaced globals (`__`, `_data`, `_proc`, `_render`, `_action`,
  `_app`). Keep this pattern; do not add ES modules or a build step.
- Keep state in `_data` and persist the relevant keys through `_app.saveData()`.
  Existing localStorage keys include `selectedChart`, `queue`, `queueIndex`,
  `useDarkTheme`, `zoom`, and `gap`.
- Match the surrounding style. The codebase mixes ES5 idioms with modern JS
  (`const`/`let`, arrow functions, optional chaining, template literals); follow
  the file you are editing.
- UI event handlers are bound either with inline `onclick="_action.foo(...)"` in
  `index.html` or assigned in `js/app.js`. Use the existing approach.
- Do not add external dependencies, CDNs, build tooling, or a test framework
  without explicit approval.
- Keep all asset paths relative so GitHub Pages subpath deployment keeps working.

## Chart file format (`.ccl`)

Charts are plain text. Example:

```text
Intro
[E // B // C#m // A //]

Verse 1
For my [E]waking breath for my [B]daily bread
[C#m]I depend on You [A]I depend on You

Chorus
[E] You're the way the truth and the life
```

- Chords are inline in square brackets immediately before the syllable they
  change on, e.g. `[G]Silent night`.
- Instrumental/chord-only lines put multiple chords in one bracket, e.g.
  `[C // Am // G/B //]`.
- Blank lines separate sections.
- `(repeat)` is rendered italic.
- Transposition only rewrites text inside `[...]`, so chords must stay in
  brackets to be transposable. Slash chords (`B/D#`) and sharp/flat notes are
  handled by `_proc._transpose`.

## Adding or editing charts

1. Add or edit the `.ccl` file under the correct `charts/<category>/` folder.
2. **Update `data.js` manually** by adding/removing the `./charts/...` path.
   The manifest is not generated, and it is currently out of sync with disk
   (there are stale entries and unlisted files), so verify before assuming.
3. Confirm the chart appears, renders correctly, and transposes in the browser.

Useful sanity check for manifest drift:

```sh
grep -o '"\./charts/[^"]*\.ccl"' data.js | tr -d '"' | sort > /tmp/data_charts.txt
find charts -name '*.ccl' | sed 's#^#./#' | sort > /tmp/disk_charts.txt
comm -3 /tmp/data_charts.txt /tmp/disk_charts.txt
```

## URL and sharing behavior

- `?song=<id>[:<transpose>]` selects one chart.
- `?queue=<id>[:<transpose>],<id>[:<transpose>],...` loads a queue.
- `?transpose=<semitones>` applies a transposition.
- Chart IDs are derived from filenames: title-cased filename, lowercased, spaces
  replaced with hyphens (see `_proc.charts`).
- `_action.share()` copies a share URL to the clipboard.

## PWA and offline behavior

- The app is installable over HTTPS or `localhost` thanks to
  `manifest.json`, `sw.js`, and `js/pwa.js`.
- `sw.js` precaches the app shell (`index.html`, CSS, JS, manifest, icons) during
  install and runtime-caches same-origin GET requests. Charts become available
  offline after they have been viewed once.
- Navigation requests are network-first with a cached `index.html` fallback.
- Bump `CACHE_VERSION` in `sw.js` when cached shell assets change so returning
  visitors receive the new files.
- Service workers do not run on `file://`; test over the local HTTP server.
- Keep manifest/icon/start URLs relative so the GitHub Pages subpath works.

## Gotchas

- `audio/*.mp3` files are not wired into any code.
- Chart loading is XHR-based; serve over HTTP rather than opening `file://`.
- `data.js` is the source of truth for which charts appear. Editing a `.ccl`
  file alone will not make a new chart show up.
- The service worker caches aggressively; use DevTools "Update on reload" while
  iterating, or bump `CACHE_VERSION`.

## Definition of done

- Changes work in a browser over a local HTTP server with no console errors.
- Any added `.ccl` file is also listed in `data.js`.
- Existing features (search, queue, transpose, zoom, dark mode, lyrics-only,
  share, print layout) still behave correctly.
- No new dependencies or build tooling were introduced.

## Next steps

This project is not complete. There are many new features to add. Below is a
list of items of which it is intended to address next. It is essentially a
roadmap for the project, so do not immediately act on these items, just understand
these are likely what will be the next topics of work for this project:

- [x]: Website supports PWA
- [-]: Improved favicon, AI generated icon is not very good, create icon manually
- [ ]: Add user accounts - personal data is saved in localstorage (auth method tbd)
    - [ ]: Auth method TBD
    - [ ]: User data is stored in localstorage
    - [ ]: Add profile page for user account
        - [ ]: User can set their profile name (profile icon is just a circle with
          the first letter of there name in it)
- [ ]: Websites navigation and page layouts implemented
  - [ ]: Navigation - have to determine where this
  - [ ]: Optimize UI rendering for mobile
  - [ ]: ...


