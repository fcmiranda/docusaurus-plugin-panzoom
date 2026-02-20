---
title: Expand Dialog
description: Open a panzoom element in a full-screen dialog
---

# Expand Dialog Example

When the `expandDialog` option is enabled, a fourth button appears in the toolbar that opens the element in a
full-screen modal dialog with its own independent panzoom instance.

## Image with expand dialog

Hover over the image to reveal the toolbar, then click the **expand** icon (⤢) to open the full-screen view.

<div className="panzoom-example">
  <img src="https://picsum.photos/800/500" alt="Scenic landscape" style={{ width: '100%', height: 'auto' }} />
</div>

## Basic element with expand dialog

<div className="panzoom-example" style={{ padding: '20px', border: '1px solid #ccc' }}>
  Drag here, use wheel to zoom, double-click to reset, or click the expand button to view in full screen.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque volutpat, quam ut placerat gravida, nunc eros
dignissim est, nec auctor sem urna a urna. Nulla vitae tincidunt quam, et maximus mi. Nunc at nisl sapien. Nulla pretium
dui neque, non facilisis elit sodales scelerisque. Aliquam ultrices ut turpis vitae iaculis. Ut sit amet neque vel ante
mattis posuere. Sed ac semper est, vitae sollicitudin felis. Mauris ac diam cursus, bibendum lorem vitae, faucibus enim.

</div>

## Configuration

Enable the feature in `docusaurus.config.ts`:

```ts
themeConfig: {
  zoom: {
    toolbar: {
      enabled: true,        // toolbar must be enabled
    },
    expandDialog: {
      enabled: true,        // show the expand button
    },
  },
},
```

The dialog supports:

- **Pan** — drag to pan
- **Zoom** — scroll wheel to zoom in / out
- **Toolbar** — zoom-in, zoom-out and reset buttons
- **Double-click** — resets zoom
- **Close** — click the × button, click the backdrop, or press `Escape`
