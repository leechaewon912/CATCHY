"use client";

import { BookmarkIcon } from "@/components/icons";

export function BookmarkButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      className={className}
    >
      <BookmarkIcon className="h-4 w-4" />
    </button>
  );
}
