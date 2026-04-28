"use client";

import { useEffect } from "react";

const VIEW_TTL_MS = 24 * 60 * 60 * 1000;
const pendingViewKeys = new Set<string>();

type ArticleViewTrackerProps = {
  articleId: number;
};

export function ArticleViewTracker({ articleId }: ArticleViewTrackerProps) {
  useEffect(() => {
    if (!articleId || typeof window === "undefined") return;

    const storageKey = `avangarda:view:${articleId}`;
    const now = Date.now();
    const previousValue = window.localStorage.getItem(storageKey);
    const previousTimestamp = previousValue ? Number(previousValue) : 0;

    if (Number.isFinite(previousTimestamp) && previousTimestamp > now - VIEW_TTL_MS) {
      return;
    }

    if (pendingViewKeys.has(storageKey)) {
      return;
    }

    pendingViewKeys.add(storageKey);

    fetch("/api/article-views", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ articleId })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to track article view");
        }

        window.localStorage.setItem(storageKey, String(now));
      })
      .catch(() => {
        pendingViewKeys.delete(storageKey);
      })
      .finally(() => {
        pendingViewKeys.delete(storageKey);
      });
  }, [articleId]);

  return null;
}
