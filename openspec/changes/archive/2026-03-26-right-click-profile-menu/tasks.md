## 1. Remove three-dots button

- [x] 1.1 Remove the `<span class="ctx-menu-btn" ...>⋮</span>` from the profile entry HTML template in `src/renderer/sidebar.ts`
- [x] 1.2 Remove the `ctxBtn` click event listener block that calls `showContextMenu`

## 2. Add right-click handler

- [x] 2.1 Add a `contextmenu` event listener to the profile `btn` element that calls `e.preventDefault()` and then `this.showContextMenu(profile, e)`

## 3. Clean up CSS

- [x] 3.1 Remove `.ctx-menu-btn` CSS rules (display, visibility, hover show/hide) from `src/renderer/styles.css`
