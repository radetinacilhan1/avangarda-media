import React, { forwardRef } from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const Field = styled.div`
  color: ${({ theme }) => theme.colors.neutral800};
  label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.75rem; }
  .controls { display: flex; align-items: center; gap: 0.75rem; }
  input[type="text"] {
    min-width: 0; flex: 1; padding: 0.65rem 0.8rem; border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.neutral300};
    background: ${({ theme }) => theme.colors.neutral0}; color: inherit;
    font-size: 0.875rem;
  }
  input[type="color"] {
    width: 2.75rem; height: 2.6rem; padding: 3px; border-radius: 4px; cursor: pointer;
    border: 1px solid ${({ theme }) => theme.colors.neutral300};
    background: ${({ theme }) => theme.colors.neutral0};
  }
  input:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary600}; outline-offset: 2px; }
  input:disabled { cursor: default; opacity: 0.6; }
  .hint, .error { margin-top: 0.5rem; font-size: 0.75rem; line-height: 1.5; }
  .hint { color: ${({ theme }) => theme.colors.neutral600}; }
  .error { color: ${({ theme }) => theme.colors.danger600}; }
`;

const MapColorInput = forwardRef(function MapColorInput({
  attribute, disabled, error, hint, intlLabel, name, onChange, required, value,
}, ref) {
  const { formatMessage } = useIntl();
  const currentValue = typeof value === "string" ? value : "";
  const valid = !currentValue || HEX_COLOR.test(currentValue);
  const errorMessage = !valid
    ? "Unesi HEX boju sa šest cifara, na primer #7C3AED."
    : error && (typeof error === "string" ? error : formatMessage(error));
  const id = `map-color-${name}`;
  const label = intlLabel ? formatMessage(intlLabel) : "Boja na mapi";
  const emitValue = (nextValue) => onChange({
    target: { name, type: attribute.type, value: nextValue || null },
  });

  return (
    <Field>
      <label htmlFor={id}>{label}{required ? " *" : ""}</label>
      <div className="controls">
        <input
          type="color"
          value={HEX_COLOR.test(currentValue) ? currentValue : "#111111"}
          disabled={disabled}
          aria-label={`${label} — izbor i pregled`}
          onChange={(event) => emitValue(event.currentTarget.value.toUpperCase())}
        />
        <input
          ref={ref}
          id={id}
          name={name}
          type="text"
          value={currentValue}
          disabled={disabled}
          required={required}
          placeholder="#RRGGBB"
          pattern="#[0-9A-Fa-f]{6}"
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={`${id}-hint${errorMessage ? ` ${id}-error` : ""}`}
          onChange={(event) => emitValue(event.currentTarget.value)}
          onBlur={() => { if (HEX_COLOR.test(currentValue)) emitValue(currentValue.toUpperCase()); }}
        />
      </div>
      <p className="hint" id={`${id}-hint`}>
        {hint || "Opciono. Unesi #RRGGBB ili ostavi prazno za stabilnu podrazumevanu boju autora."}
      </p>
      {errorMessage && <p className="error" id={`${id}-error`} role="alert">{errorMessage}</p>}
    </Field>
  );
});

export default MapColorInput;
