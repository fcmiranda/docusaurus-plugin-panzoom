# docusaurus-plugin-panzoom

This plugin adds the ability to pan and zoom images and SVG images inside of a Docusaurus website. This is useful for
embedding diagrams or complex mermaid.js renders around models and object schemas. The normal theme doesn't scale
tremendously well in a browser so some augmentation for complex diagrams is necessary.

This implements the excellent [@panzoom/panzoom](https://www.npmjs.com/package/@panzoom/panzoom) plugin.

## Installation

```bash
npm install @fdevbr/docusaurus-plugin-panzoom
```

```javascript
// In docusaurus.config.js
// ...
plugins: ['@fdevbr/docusaurus-plugin-panzoom'],
// or
plugins: [['@fdevbr/docusaurus-plugin-panzoom', {} /* options */]],
```

## Configuration

The plugin accepts the following configuration options:

```javascript
// In docusaurus.config.js
// ...
themeConfig: {
  zoom: {
    // A list of selectors to look for elements to enable pan and zoom
    // Default: ['div.mermaid[data-processed="true"]', 'div.docusaurus-mermaid-container', '.drawio']
    selectors: ['div.mermaid[data-processed="true"]', '.drawio'],

    // Whether to wrap the panzoom items in a div with overflow:hidden
    // This constrains the pan zoom detail into the original container
    // Default: true
    wrap: true,

    // The amount of time to wait in MS before the plugin client module tries to look for
    // and alter pan zoom elements. Some renders take a little bit before they appear in the dom.
    // Default: 1000
    timeout: 1000,

    // Add this class to any element within the Panzoom element that you want to exclude from
    // Panzoom handling. That element's children will also be excluded.
    // Default: 'panzoom-exclude'
    excludeClass: 'panzoom-exclude',

    // Whether to enable zooming with the mouse wheel.
    // Default: true
    enableWheelZoom: true,

    // Whether to enable zooming with the mouse wheel while holding the shift key.
    // Works independently of enableWheelZoom.
    // Default: false
    enableWheelZoomWithShift: false,

    // Whether to enable double-click to reset zoom.
    // Default: true
    enableDoubleClickResetZoom: true,

    // Whether to restrict zooming out beyond the original size of the element.
    // Default: false
    restrictZoomOutBeyondOrigin: false,

    // Toolbar options: shows zoom in, zoom out, and reset buttons.
    toolbar: {
      // Whether to show the toolbar.
      // Default: false
      enabled: false,

      // Toolbar position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
      // Default: 'top-right'
      position: 'top-right',

      // Toolbar opacity when not hovered (0 to 1). Becomes fully opaque on hover.
      // Default: 0
      opacity: 0,
    },

    // Expand feature: adds an expand button to the toolbar that hides the sidebar, TOC,
    // navbar, and site footer, expanding the diagram to near-full-width.
    // Requires toolbar.enabled: true
    expand: {
      // Whether to show the expand button in the toolbar.
      // Default: false
      enabled: false,
    },

    // You can also pass any options supported by @panzoom/panzoom
    // See: https://github.com/timmywil/panzoom for available options
  }
}
```

## Expand Feature

This fork adds an **in-page expand mode**: when `expand.enabled` is set to `true`, an expand button appears in the
toolbar. Clicking it (or pressing `Escape` to exit) triggers the following behaviour:

**On expand:**

- Hides the sidebar, table-of-contents column, navbar, and site footer
- Stretches the main content area to near-full-width
- Scrolls to the top of the page so the diagram is immediately visible
- The toolbar buttons become `position: fixed` so they stay on screen while panning/zooming

**On collapse:**

- Restores all hidden elements
- Smoothly scrolls back to the diagram so you don't lose your place
- The toolbar expand button icon resets correctly (including when closed via `Escape`)

```javascript
themeConfig: {
  zoom: {
    toolbar: { enabled: true },
    expand: { enabled: true },
  }
}
```

> [!NOTE] This package is a fork of
> [@r74tech/docusaurus-plugin-panzoom](https://github.com/r74tech/docusaurus-plugin-panzoom), which itself is a fork of
> [act-org/docusaurus-plugin-panzoom](https://github.com/act-org/docusaurus-plugin-panzoom), under the MIT license.
>
> Changes introduced in this fork (`@fdevbr`):
>
> - **In-page expand mode**: adds an expand button that hides the sidebar, TOC, navbar, and site footer and expands the
>   diagram to near-full-width inline, without opening a dialog.
> - **Fixed toolbar in expand mode**: toolbar buttons stay pinned to the viewport corner while panning.
> - **Scroll to top on expand**: the page scrolls to the top when expand mode is activated.
> - **Scroll back on collapse**: the page scrolls back to the diagram when expand mode is exited.
>
> If you don't need the expand feature, consider using
> [@r74tech/docusaurus-plugin-panzoom](https://www.npmjs.com/package/@r74tech/docusaurus-plugin-panzoom) directly.

## License

MIT, see [LICENSE](LICENSE) for more details.
