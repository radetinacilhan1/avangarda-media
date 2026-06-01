"use client";

import { useEffect } from "react";

function protectImageNode(node: HTMLImageElement) {
  if (node.dataset.downloadable === "true") return;
  node.draggable = false;
  node.dataset.protectedMedia = "true";
}

export function ImageProtectionBoundary() {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const applyProtection = (root: ParentNode) => {
      root.querySelectorAll("img").forEach((image) => protectImageNode(image));
    };

    applyProtection(document);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;

          if (node.tagName === "IMG") {
            protectImageNode(node as HTMLImageElement);
          }

          applyProtection(node);
        }
      }
    });

    const onContextMenu = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;

      const image = event.target.closest("img");
      if (image instanceof HTMLImageElement && image.dataset.downloadable !== "true") {
        event.preventDefault();
      }
    };

    const onDragStart = (event: DragEvent) => {
      if (!(event.target instanceof Element)) return;

      const image = event.target.closest("img");
      if (image instanceof HTMLImageElement && image.dataset.downloadable !== "true") {
        event.preventDefault();
      }
    };

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("dragstart", onDragStart, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("dragstart", onDragStart, true);
    };
  }, []);

  return null;
}
