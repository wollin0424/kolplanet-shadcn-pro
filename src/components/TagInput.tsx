"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { formInputClass } from "@/lib/formControls";
import { X } from "@/lib/icons";
import { cn } from "@/lib/utils";

type TagInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  formatTag?: (raw: string) => string;
  className?: string;
};

export function TagInput({
  value,
  onChange,
  placeholder,
  formatTag,
  className,
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commitTag = (raw: string) => {
    const trimmed = raw.trim().replace(/,$/, "");
    if (!trimmed) return;

    const tag = formatTag ? formatTag(trimmed) : trimmed;
    if (!tag || value.includes(tag)) {
      setDraft("");
      return;
    }

    onChange([...value, tag]);
    setDraft("");
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTag(draft);
      return;
    }

    if (e.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div
      className={cn(
        formInputClass(),
        "flex h-auto min-h-10 cursor-text flex-wrap items-center gap-1.5 py-1.5",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[13px] text-gray-800"
        >
          <span className="truncate">{tag}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(index);
            }}
            className="inline-flex size-4 shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200/80 hover:text-gray-600"
            aria-label={`Remove ${tag}`}
          >
            <X size={11} strokeWidth={2} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commitTag(draft)}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="min-w-[72px] flex-1 border-0 bg-transparent p-0 text-[13px] text-gray-800 outline-none placeholder:text-gray-300 focus-visible:ring-0"
      />
    </div>
  );
}

export function formatHashtagTag(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}
