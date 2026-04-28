"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type NamedOption = {
  label: string;
  value: string;
};

type ArchiveFilterFormProps = {
  lang: string;
  searchPlaceholder: string;
  applyLabel: string;
  defaults: {
    q: string;
    section: string;
    topic: string;
    author: string;
    year: string;
    style: string;
    location: string;
    sort: string;
  };
  options: {
    sections: NamedOption[];
    topics: NamedOption[];
    authors: NamedOption[];
    years: NamedOption[];
    styles: NamedOption[];
    locations: NamedOption[];
    sorts: NamedOption[];
  };
  labels: {
    section: string;
    topic: string;
    author: string;
    year: string;
    style: string;
    location: string;
  };
};

type SelectKey = "section" | "topic" | "author" | "year" | "style" | "location" | "sort";

function ArchiveSelect({
  name,
  value,
  options,
  placeholder,
  open,
  onToggle,
  onSelect
}: {
  name: SelectKey;
  value: string;
  options: NamedOption[];
  placeholder: string;
  open: boolean;
  onToggle: (name: SelectKey) => void;
  onSelect: (name: SelectKey, value: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onToggle(name);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onToggle(name);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [name, onToggle, open]);

  const selectedLabel = useMemo(() => {
    return options.find((option) => option.value === value)?.label || placeholder;
  }, [options, placeholder, value]);

  return (
    <div ref={rootRef} className={`archive-select${open ? " archive-select--open" : ""}`}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        className="archive-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => onToggle(name)}
      >
        <span className={`archive-select__label${value ? " archive-select__label--selected" : ""}`}>
          {selectedLabel}
        </span>
        <span className="archive-select__caret" aria-hidden="true" />
      </button>

      {open ? (
        <div className="archive-select__menu" role="listbox" aria-label={placeholder}>
          {options.map((option) => (
            <button
              key={`${name}-${option.value || "all"}`}
              type="button"
              className={`archive-select__option${option.value === value ? " archive-select__option--active" : ""}`}
              onClick={() => onSelect(name, option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ArchiveFilterForm({
  lang,
  searchPlaceholder,
  applyLabel,
  defaults,
  options,
  labels
}: ArchiveFilterFormProps) {
  const [openSelect, setOpenSelect] = useState<SelectKey | null>(null);
  const [values, setValues] = useState(defaults);

  function toggleSelect(name: SelectKey) {
    setOpenSelect((current) => (current === name ? null : name));
  }

  function handleSelect(name: SelectKey, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setOpenSelect(null);
  }

  return (
    <form action="/archive" method="get" autoComplete="off" className="archive-form archive-form--expanded">
      <input type="hidden" name="lang" value={lang} />

      <input
        className="field archive-form__search"
        name="q"
        type="search"
        autoComplete="off"
        spellCheck={false}
        defaultValue={defaults.q}
        placeholder={searchPlaceholder}
      />

      <ArchiveSelect
        name="section"
        value={values.section}
        options={options.sections}
        placeholder={labels.section}
        open={openSelect === "section"}
        onToggle={toggleSelect}
        onSelect={handleSelect}
      />
      <ArchiveSelect
        name="topic"
        value={values.topic}
        options={options.topics}
        placeholder={labels.topic}
        open={openSelect === "topic"}
        onToggle={toggleSelect}
        onSelect={handleSelect}
      />
      <ArchiveSelect
        name="author"
        value={values.author}
        options={options.authors}
        placeholder={labels.author}
        open={openSelect === "author"}
        onToggle={toggleSelect}
        onSelect={handleSelect}
      />
      <ArchiveSelect
        name="year"
        value={values.year}
        options={options.years}
        placeholder={labels.year}
        open={openSelect === "year"}
        onToggle={toggleSelect}
        onSelect={handleSelect}
      />
      <ArchiveSelect
        name="style"
        value={values.style}
        options={options.styles}
        placeholder={labels.style}
        open={openSelect === "style"}
        onToggle={toggleSelect}
        onSelect={handleSelect}
      />
      <ArchiveSelect
        name="location"
        value={values.location}
        options={options.locations}
        placeholder={labels.location}
        open={openSelect === "location"}
        onToggle={toggleSelect}
        onSelect={handleSelect}
      />
      <ArchiveSelect
        name="sort"
        value={values.sort}
        options={options.sorts}
        placeholder={labels.section}
        open={openSelect === "sort"}
        onToggle={toggleSelect}
        onSelect={handleSelect}
      />

      <button className="button-ghost" type="submit">{applyLabel}</button>
    </form>
  );
}
