"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export type ComboboxItem = {
  id: string;
  label: string;
  detail?: string;
  hint?: string;
  searchText?: string;
};

type ComboboxProps = {
  items: ComboboxItem[];
  value: string;
  onChange: (id: string) => void;
  onSelect?: (item: ComboboxItem) => void;
  name?: string;
  placeholder?: string;
  emptyMessage?: string;
  detailPrefix?: string;
  hintPrefix?: string;
  maxResults?: number;
  className?: string;
  selectedInfo?: React.ReactNode;
};

const DEFAULT_MAX = 50;

export function Combobox({
  items,
  value,
  onChange,
  onSelect,
  name,
  placeholder = "Buscar…",
  emptyMessage = "Sin resultados",
  detailPrefix = "",
  hintPrefix = "",
  maxResults = DEFAULT_MAX,
  className,
  selectedInfo,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasFocusedRef = useRef(false);
  const listId = useId();

  const selected = items.find((i) => i.id === value) ?? null;

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.label, i.detail, i.hint, i.searchText].filter(Boolean).some((t) =>
        (t as string).toLowerCase().includes(q)
      )
    );
  }, [items, query]);

  const commit = useCallback(
    (item: ComboboxItem) => {
      if (item.id !== value) onChange(item.id);
      setQuery(item.label);
      setOpen(false);
      setHighlighted(null);
    },
    [value, onChange]
  );

  const confirmar = useCallback(
    (item: ComboboxItem) => {
      commit(item);
      onSelect?.(item);
    },
    [commit, onSelect]
  );

  function handleQueryChange(raw: string) {
    setQuery(raw);
    setOpen(true);
    setHighlighted(null);
    if (selected) return;
    const q = raw.trim();
    if (!q) return;
    const qLower = q.toLowerCase();
    const matches = items.filter((i) =>
      [i.label, i.detail, i.hint, i.searchText].filter(Boolean).some((t) =>
        (t as string).toLowerCase().includes(qLower)
      )
    );
    if (matches.length !== 1) return;
    const unico = matches[0];
    const tokens = [unico.detail, unico.hint, unico.searchText].filter(Boolean) as string[];
    if (tokens.some((t) => t.toLowerCase() === qLower)) {
      commit(unico);
    }
  }

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const idx = filtrados.findIndex((i) => i.id === highlighted);
      const next = filtrados[Math.min(filtrados.length - 1, idx + 1)];
      if (next) setHighlighted(next.id);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = filtrados.findIndex((i) => i.id === highlighted);
      const prev = filtrados[Math.max(0, idx - 1)];
      if (prev) setHighlighted(prev.id);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item =
        filtrados.find((i) => i.id === highlighted) ??
        (filtrados.length === 1 ? filtrados[0] : null);
      if (item) confirmar(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 transition-colors focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
        <SearchIcon className="h-4 w-4 shrink-0 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={query || (selected ? selected.label : "")}
          onChange={(e) => handleQueryChange(e.target.value)}
          onMouseDown={() => {
            wasFocusedRef.current = document.activeElement === inputRef.current;
          }}
          onClick={() => {
            if (wasFocusedRef.current) setOpen((o) => !o);
          }}
          onFocus={(e) => {
            setOpen(true);
            e.currentTarget.select();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-full flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          suppressHydrationWarning
        />
        {selected && !open && (
          <button
            type="button"
            aria-label="Limpiar selección"
            suppressHydrationWarning
            onClick={() => {
              setQuery("");
              if (value) onChange("");
              setOpen(true);
              inputRef.current?.focus();
            }}
            className="shrink-0 text-zinc-400 transition-colors hover:text-zinc-600"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          suppressHydrationWarning
          aria-label={open ? "Cerrar lista" : "Abrir lista"}
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 text-zinc-400 transition-colors hover:text-zinc-600"
        >
          <ChevronDownIcon
            className={cn(
              "h-4 w-4 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </div>

      {selected && (
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          {selected.detail && (
            <span className="text-zinc-500">
              {detailPrefix && <span className="text-zinc-400">{detailPrefix} </span>}
              <span className="font-mono font-medium">{selected.detail}</span>
            </span>
          )}
          {selected.hint && (
            <span className="text-zinc-400">
              {hintPrefix && <span>{hintPrefix} </span>}
              <span className="font-mono">{selected.hint}</span>
            </span>
          )}
          {selectedInfo && <span className="text-zinc-500">{selectedInfo}</span>}
        </div>
      )}

      {open && (
        <div
          id={listId}
          role="listbox"
          className="no-scrollbar absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
        >
          {filtrados.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-zinc-400">{emptyMessage}</p>
          ) : (
            filtrados.slice(0, maxResults).map((item) => (
              <button
                key={item.id}
                type="button"
                suppressHydrationWarning
                onMouseEnter={() => setHighlighted(item.id)}
                onClick={() => confirmar(item)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors",
                  highlighted === item.id && "bg-indigo-50"
                )}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-snug text-zinc-900">
                    {item.label}
                  </span>
                  {item.detail && (
                    <span className="block truncate font-mono text-xs text-zinc-400">
                      {detailPrefix ? `${detailPrefix} ${item.detail}` : item.detail}
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {item.hint && (
                    <span className="font-mono text-xs text-zinc-400">
                      {hintPrefix ? `${hintPrefix} ${item.hint}` : item.hint}
                    </span>
                  )}
                  {value === item.id && <CheckIcon className="h-4 w-4 text-indigo-600" />}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
