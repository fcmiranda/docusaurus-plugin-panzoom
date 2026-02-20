import panzoom, { PanzoomObject } from '@panzoom/panzoom';
import type { ClientModule } from '@docusaurus/types';
import { PanZoomPluginOptions, PanZoomPluginToolbarPosition } from './PanzoomPluginOptions';
import SvgZoomIn from './img/zoom-in';
import SvgZoomOut from './img/zoom-out';
import SvgZoomReset from './img/zoom-reset';
import SvgZoomExpand from './img/zoom-expand';
import './styles/panzoom.css';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const config = require('@generated/docusaurus.config').default;
const { themeConfig } = config;
const { zoom }: { zoom: PanZoomPluginOptions } = themeConfig;
const {
  selectors = ['div.mermaid[data-processed="true"]', 'div.docusaurus-mermaid-container', '.drawio'],
  wrap = true,
  timeout = 1000,
  excludeClass = 'panzoom-exclude',
  toolbar: { enabled = false, position = PanZoomPluginToolbarPosition.TopRight, opacity = 0 } = {},
  enableWheelZoom = true,
  enableWheelZoomWithShift = false,
  enableDoubleClickResetZoom = true,
  restrictZoomOutBeyondOrigin = false,
  expand: { enabled: expandEnabled = false } = {},
  ...panZoomConfig
} = zoom;

// SVG close icon (Material Symbols "close")
const SvgClose =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>';

/**
 * Creates a toolbar with zoom controls for a panzoom instance
 *
 * @param container The container element to append the toolbar to
 * @param instance The panzoom instance to control
 * @param position The position of the toolbar
 * @param expandToggle Optional expand/collapse callbacks to wire into the toggle button
 */
const createToolbar = (
  container: HTMLElement,
  instance: PanzoomObject,
  position: PanZoomPluginToolbarPosition,
  expandToggle?: { open: () => void; close: () => void },
) => {
  const toolbar = document.createElement('div');
  toolbar.className = `panzoom-toolbar panzoom-toolbar-${position} ${excludeClass}`;

  // Apply custom opacity from configuration
  toolbar.style.opacity = opacity.toString();

  // Prevent double-click events from bubbling up to the container
  // By default the panzoom library will reset on double click
  toolbar.addEventListener('dblclick', (e) => {
    e.stopPropagation();
  });

  // Helper function to create toolbar buttons
  const createButton = (svg: string, title: string, action: () => void): HTMLButtonElement => {
    const button = document.createElement('button');
    button.innerHTML = svg;
    button.title = title;
    button.className = excludeClass;
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      action();
    });
    return button;
  };

  // Create and append all buttons

  const buttons = [
    // Zoom in
    createButton(SvgZoomIn, 'Zoom in', () => {
      instance.zoomIn();
    }),
    // Zoom out
    createButton(SvgZoomOut, 'Zoom out', () => {
      if (!restrictZoomOutBeyondOrigin) {
        instance.zoomOut();
        return;
      }
      if (instance.getScale() > 1) {
        instance.zoomOut();
      }
    }),
    // Reset zoom
    createButton(SvgZoomReset, 'Reset zoom', () => {
      instance.reset();
    }),
  ];

  // Expand / collapse toggle button — swaps icon and title between states
  if (expandEnabled && expandToggle) {
    const expandBtn = document.createElement('button');
    expandBtn.innerHTML = SvgZoomExpand;
    expandBtn.title = 'Expand';
    expandBtn.className = excludeClass;
    expandBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (container.classList.contains('panzoom-expand-active')) {
        expandToggle.close();
        expandBtn.innerHTML = SvgZoomExpand;
        expandBtn.title = 'Expand';
      } else {
        expandToggle.open();
        expandBtn.innerHTML = SvgClose;
        expandBtn.title = 'Collapse';
      }
    });
    buttons.push(expandBtn);
  }

  buttons.forEach((button) => toolbar.appendChild(button));
  container.appendChild(toolbar);
};

/**
 * Creates an in-page expand experience for a panzoom element.
 *
 * When activated, hides the Docusaurus sidebar and right TOC column, expands
 * the main content container to close 100% width. The original panzoom
 * instance and element remain untouched — no cloning, no modal/dialog.
 *
 * Returns { open, close } so the toolbar button can toggle both the layout
 * state and its own icon/title.
 *
 * Targets:
 *   - Sidebar     : aside.theme-doc-sidebar-container   (stable ThemeClassName)
 *   - TOC col     : .col--3                             (Docusaurus grid class)
 *   - Main        : main[class*="docMainContainer"]     (CSS-module element)
 *   - Content col : [class*="docItemCol"]               (CSS-module element)
 *
 * @param container The wrapper element that holds the panzoom element
 */
const createExpandToggle = (container: HTMLElement): { open: () => void; close: () => void } => {
  const getLayoutElements = () => {
    const sidebar = document.querySelector<HTMLElement>('aside.theme-doc-sidebar-container');
    // The right TOC column is a direct child of the .row that also contains the docItemCol
    const tocCol = document.querySelector<HTMLElement>('.col--3');
    const mainContainer = document.querySelector<HTMLElement>('[class*="docMainContainer"]');
    // The doc content column (CSS-module class docItemCol) — targeted via attribute selector
    const docItemCol = document.querySelector<HTMLElement>('[class*="docItemCol"]');
    // The infima .container div inside the main container (holds padding/max-width)
    const docContainer = mainContainer?.querySelector<HTMLElement>(':scope > .container') ?? null;
    return { sidebar, tocCol, mainContainer, docItemCol, docContainer };
  };

  /**
   * Collect all sibling elements that should be hidden when the panzoom
   * container is expanded. Walks up the DOM from `container` to `article`
   * (inclusive), tagging every sibling of each ancestor with
   * `panzoom-expand-sibling`. Stops at `article` so page chrome above
   * (navbar, etc.) is never touched.
   */
  const getSiblings = (): HTMLElement[] => {
    const siblings: HTMLElement[] = [];
    let node: HTMLElement | null = container;

    while (node && node.tagName.toLowerCase() !== 'article') {
      const parent: HTMLElement | null = node.parentElement;
      if (parent) {
        Array.from(parent.children).forEach((child) => {
          if (child !== node && child instanceof HTMLElement) {
            siblings.push(child);
          }
        });
      }
      node = parent;
    }

    // Also hide article-level siblings (breadcrumbs, version badge, mobile
    // TOC, footer) and the paginator that sits just below the article.
    if (node && node.tagName.toLowerCase() === 'article') {
      const articleParent = node.parentElement;
      if (articleParent) {
        Array.from(articleParent.children).forEach((child) => {
          if (child !== node && child instanceof HTMLElement) {
            siblings.push(child);
          }
        });
      }
    }

    return siblings;
  };

  const open = () => {
    const { sidebar, tocCol, mainContainer, docItemCol, docContainer } = getLayoutElements();

    if (sidebar) sidebar.classList.add('panzoom-expand-hidden');
    if (tocCol) tocCol.classList.add('panzoom-expand-hidden');
    if (mainContainer) mainContainer.classList.add('panzoom-expand-main');
    if (docItemCol) docItemCol.classList.add('panzoom-expand-doc-item');
    if (docContainer) docContainer.classList.add('panzoom-expand-container');

    getSiblings().forEach((el) => el.classList.add('panzoom-expand-sibling'));

    container.classList.add('panzoom-expand-active');
  };

  const close = () => {
    const { sidebar, tocCol, mainContainer, docItemCol, docContainer } = getLayoutElements();

    if (sidebar) sidebar.classList.remove('panzoom-expand-hidden');
    if (tocCol) tocCol.classList.remove('panzoom-expand-hidden');
    if (mainContainer) mainContainer.classList.remove('panzoom-expand-main');
    if (docItemCol) docItemCol.classList.remove('panzoom-expand-doc-item');
    if (docContainer) docContainer.classList.remove('panzoom-expand-container');

    document.querySelectorAll<HTMLElement>('.panzoom-expand-sibling').forEach((el) => {
      el.classList.remove('panzoom-expand-sibling');
    });

    container.classList.remove('panzoom-expand-active');
  };

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && container.classList.contains('panzoom-expand-active')) {
      close();
    }
  });

  return { open, close };
};

/**
 * Attach event listeners to the element where panzoom is applied.
 * The listeners to add are based on the configuration options provided.
 *
 * @param element The element to add event listeners to
 * @param instance The panzoom instance to control
 */
const addEventListeners = (element: HTMLElement, instance: PanzoomObject) => {
  const handleZoomWithWheel = (event: WheelEvent) => {
    if (restrictZoomOutBeyondOrigin) {
      // Allow zooming in or zooming out only to the original size
      if (event.deltaY < 0 || (event.deltaY > 0 && instance.getScale() > 1)) {
        instance.zoomWithWheel(event);
      }
    } else {
      instance.zoomWithWheel(event);
    }
  };

  // Handle the wheel zoom functionality if at least one of the options is enabled
  if (enableWheelZoom || enableWheelZoomWithShift) {
    element.addEventListener('wheel', (event) => {
      // Handle zoom with shift key
      if (enableWheelZoomWithShift && event.shiftKey) {
        handleZoomWithWheel(event);
        return;
      }

      // Handle regular zoom
      if (enableWheelZoom && !event.shiftKey) {
        handleZoomWithWheel(event);
      }
    });
  }

  // Handle double-click reset zoom
  if (enableDoubleClickResetZoom) {
    element.addEventListener('dblclick', () => {
      instance.reset();
    });
  }
};

/**
 * Main work method to zoom the set of elements.  You can pass in global options to the pan zoom component
 * as well as control whether the items will be wrapped.
 *
 * @param selectors
 */
const zoomElements = (selectors: string[]) => {
  const foundElements: Element[] = [];

  selectors.forEach((selector) => {
    foundElements.push(...document.querySelectorAll(selector));
  });

  foundElements.forEach((element) => {
    // Guard against double-initialisation (e.g. StrictMode or repeated route updates)
    if (element.getAttribute('data-panzoom')) return;
    element.setAttribute('data-panzoom', 'true');

    const instance = panzoom(element as HTMLElement, { excludeClass, ...panZoomConfig });
    let container: HTMLElement;

    if (wrap) {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('style', 'overflow: hidden; position: relative;');
      element.parentElement?.insertBefore(wrapper, element);
      wrapper.appendChild(element);
      container = wrapper;
    } else {
      const htmlElement = element as HTMLElement;
      htmlElement.style.position = 'relative';
      container = htmlElement;
    }

    addEventListeners(container, instance);

    // Add toolbar if enabled
    if (enabled) {
      // Wire the expand toggle (if feature is on) into the toolbar
      const expandToggle = expandEnabled ? createExpandToggle(container) : undefined;
      createToolbar(container, instance, position, expandToggle);
    }
  });
};

/**
 * Client module implementation.  Wait a bit before trying this, some components like mermaid take a second to process / render
 */
const ZoomModule: ClientModule = {
  onRouteDidUpdate() {
    setTimeout(() => {
      zoomElements(selectors);
    }, timeout);
  },
};

export default ZoomModule;
