"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { readBookmarks, writeBookmarks, type Bookmark } from "@/lib/bookmarks";

type BookmarksContextValue = {
  bookmarks: Bookmark[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
};

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reading localStorage must happen post-mount, not during render, to
    // keep the server-rendered markup (no window) and first client paint identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBookmarks(readBookmarks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeBookmarks(bookmarks);
  }, [bookmarks, hydrated]);

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((bookmark) => bookmark.id === id),
    [bookmarks],
  );

  const toggleBookmark = useCallback((bookmark: Bookmark) => {
    setBookmarks((prev) =>
      prev.some((existing) => existing.id === bookmark.id)
        ? prev.filter((existing) => existing.id !== bookmark.id)
        : [bookmark, ...prev],
    );
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
  }, []);

  return (
    <BookmarksContext.Provider
      value={{ bookmarks, isBookmarked, toggleBookmark, removeBookmark }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarksProvider");
  }
  return context;
}
