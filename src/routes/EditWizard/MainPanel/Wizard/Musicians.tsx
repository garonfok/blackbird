import { SelectMusicians } from "./components/SelectMusicians";

export function Musicians() {
  return (
    <div className="edit-wizard-panel">
      <SelectMusicians role="arranger" />
      <SelectMusicians role="transcriber" />
      <SelectMusicians role="orchestrator" />
      <SelectMusicians role="lyricist" />
    </div>
  );
}
