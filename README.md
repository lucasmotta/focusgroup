<p align="center">
  <img src="./assets/logo-light.svg#gh-light-mode-only" alt="focusgroup-polyfill" width="96" />
  <img src="./assets/logo-dark.svg#gh-dark-mode-only" alt="focusgroup-polyfill" width="96" />
</p>

# focusgroup-polyfill

A polyfill for the HTML [`focusgroup`](https://open-ui.org/components/scoped-focusgroup.explainer) attribute — declarative arrow-key navigation for composite widgets, no JavaScript required.

The `focusgroup` attribute is an [Open UI proposal](https://open-ui.org/components/scoped-focusgroup.explainer) that lets you add keyboard navigation to toolbars, tablists, menus, grids, and other composite widgets with a single HTML attribute. This polyfill brings that behavior to browsers today.

## Install

```bash
npm install focusgroup-polyfill
```

## Usage

### Script tag (auto-initializes)

```html
<script src="https://unpkg.com/focusgroup-polyfill/dist/index.global.js"></script>

<div focusgroup="toolbar wrap" aria-label="Formatting">
  <button>Bold</button>
  <button>Italic</button>
  <button>Underline</button>
</div>
```

### ES module

```js
import 'focusgroup-polyfill'
```

The polyfill auto-initializes on import. It's a no-op if the browser supports `focusgroup` natively.

### Manual control

```js
import { init, destroy, isSupported } from 'focusgroup-polyfill'

if (!isSupported()) {
  init()

  // Later, to tear down:
  destroy()
}
```

## Behaviors

The first token in the `focusgroup` attribute specifies the behavior:

| Behavior | Navigation | Default modifiers | Roles applied |
|---|---|---|---|
| `toolbar` | Left/Right | `inline` | `toolbar` |
| `tablist` | Left/Right, wraps | `inline wrap` | `tablist` → `tab` |
| `radiogroup` | All arrows, wraps | `wrap` | `radiogroup` → `radio` |
| `listbox` | Up/Down | `block` | `listbox` → `option` |
| `menu` | Up/Down, wraps | `block wrap` | `menu` → `menuitem` |
| `menubar` | Left/Right, wraps | `inline wrap` | `menubar` → `menuitem` |
| `tree` | Up/Down | `block` | `tree` → `treeitem` |
| `grid` | 2D arrows | — | — |

## Modifiers

Add modifiers after the behavior token, separated by spaces:

```html
<div focusgroup="toolbar wrap nomemory">
```

| Modifier | Effect |
|---|---|
| `inline` | Restrict to inline-axis arrows (Left/Right in LTR) |
| `block` | Restrict to block-axis arrows (Up/Down in horizontal) |
| `wrap` | Wrap from last item to first (and vice versa) |
| `nowrap` | Disable wrapping (overrides behavior defaults) |
| `nomemory` | Don't remember last-focused item on re-entry |

### Grid modifiers

```html
<div focusgroup="grid row-flow col-wrap">
```

| Modifier | Effect |
|---|---|
| `wrap` | Wrap both rows and columns |
| `flow` | Flow both axes (end of row → start of next row) |
| `row-wrap` / `col-wrap` | Per-axis wrapping |
| `row-flow` / `col-flow` | Per-axis flow |
| `row-none` / `col-none` | Per-axis hard stops |

## Examples

### Toolbar

```html
<div focusgroup="toolbar wrap" aria-label="Actions">
  <button>Cut</button>
  <button>Copy</button>
  <button>Paste</button>
</div>
```

Arrow keys navigate between buttons. Wrap sends focus from last → first.

### Tablist

```html
<div focusgroup="tablist nomemory" aria-label="Settings">
  <button aria-selected="true" aria-controls="general" focusgroupstart>General</button>
  <button aria-selected="false" aria-controls="advanced">Advanced</button>
</div>
<div id="general" role="tabpanel">...</div>
<div id="advanced" role="tabpanel" hidden>...</div>
```

`focusgroupstart` determines which tab receives focus on entry. `nomemory` ensures it always returns to that tab.

### Grid (CSS Grid)

```html
<div focusgroup="grid wrap" role="grid" style="display: grid; grid-template-columns: repeat(4, 1fr);">
  <button>A1</button>
  <button>A2</button>
  <button>A3</button>
  <button>A4</button>
  <button>B1</button>
  <button>B2</button>
  <button>B3</button>
  <button>B4</button>
</div>
```

The polyfill reads `grid-template-columns` to determine the column count and maps arrow keys to 2D navigation. The container must be `display: grid` — a console warning is emitted otherwise.

### Nested focusgroups

```html
<div focusgroup="menubar" aria-label="App">
  <button>File</button>
  <button>Edit</button>
  <div focusgroup="toolbar" aria-label="Quick Actions">
    <button>Save</button>
    <button>Undo</button>
  </div>
  <button>Help</button>
</div>
```

Each focusgroup navigates independently. The inner toolbar's arrow keys don't affect the menubar.

### Opt-out

```html
<div focusgroup="toolbar">
  <button>A</button>
  <div focusgroup="none">
    <button>Excluded from arrow navigation</button>
  </div>
  <button>B</button>
</div>
```

## Features

- **Roving tabindex** — exactly one item per focusgroup is in the Tab order
- **Last-focused memory** — re-entering via Tab restores the last focused item
- **`focusgroupstart`** — specify which item receives focus on initial entry
- **Writing mode aware** — arrow keys follow `direction` (LTR/RTL) and `writing-mode`
- **Home/End** — jump to first/last item
- **Key conflict detection** — arrow keys pass through to inputs, textareas, contenteditable; Tab/Shift+Tab escapes to the next focusgroup item
- **Role inference** — container and `<button>` children get ARIA roles from the behavior token
- **Shadow DOM** — works across shadow boundaries
- **Dynamic DOM** — MutationObserver picks up added/removed items
- **Feature detection** — no-op when native `focusgroup` is available

## Playground

Run the playground locally:

```bash
npm install
npm run build
npx serve . -l 3000
```

Then open [http://localhost:3000/playground.html](http://localhost:3000/playground.html).

## Development

```bash
npm install
npm run build        # Build ESM, CJS, and IIFE bundles
npm test             # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run typecheck    # TypeScript check
```

## Browser support

The polyfill targets ES2020 and works in all modern browsers. Playwright tests run against Chromium, Firefox, and WebKit.

## License

MIT
