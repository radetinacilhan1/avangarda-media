"use client";

const OPEN_ASSISTANT_EVENT = "avangarda:open-assistant";

type HelpCompassTriggerProps = {
  label: string;
};

export function HelpCompassTrigger({ label }: HelpCompassTriggerProps) {
  return (
    <button
      type="button"
      className="button-primary help-page__compass-button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(OPEN_ASSISTANT_EVENT));
        }
      }}
    >
      {label}
    </button>
  );
}
